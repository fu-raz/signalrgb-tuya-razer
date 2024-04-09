import udp from '@SignalRGB/udp';

import BaseClass from './Libs/BaseClass.test.js';
import crc32 from './Libs/CRC32.test.js';
import { Word32Array } from './Crypto/lib/Word32Array.test.js';
import { Utf8 } from './Crypto/Utf8.test.js';
import { AES } from './Crypto/AES.test.js';
import { GCM } from './Crypto/mode/GCM.test.js';
import { Hex } from './Crypto/Hex.test.js';
import { Base64 } from './Crypto/Base64.test.js';
import TuyaMessage from './TuyaMessage.test.js';

export default class TuyaNegotiator extends BaseClass
{
    constructor()
    {
        super();
        this.port = 40001;
        this.socket = udp.createSocket();

        this.serverIp = null;
        this.broadcastIp = '192.168.100.255';

        this.uuid = this.getUUID();
        this.crc = this.getCrc(this.uuid);

        this.devices = {};

        this.lastQueue = 0;
        this.shouldNegotiate = false;
        this.negotiationAttempts = 0;

        this.currentSequence = 0x01;
        this.dataLength = 42;
        
        this.type = {
            negotiationRequest  : '00000005',
            negotiationResponse : '00000006',
            command             : '00000010'
        };

        this.header = '00006699';
        this.versionReserved = '00';
        this.reserved = '00';
        this.key = '6f36045d84b042e01e29b7c819e37cf7';
        this.tail = '00009966';

        this.init();
    }

    init()
    {
        this.socket.on('message', this.onPacketReceived.bind(this));
        this.socket.on('listening', this.onListening.bind(this));
        this.socket.on('error', service.log);
        this.socket.bind(this.port);
    }

    getUUID()
    {
        return '420691337420b00b'; // We could randomize this if needed
    }

    getCrc(uuid)
    {
        let hexString = this.zeroPad(this.hexFromString(uuid), 50, true);
        let hexArray = this.byteArrayFromHex(hexString + '00');
        return crc32(hexArray);
    }

    addDevice(tuyaDevice)
    {
        this.devices[tuyaDevice.crc] = tuyaDevice;
        this.negotiate();
    }

    onListening()
    {
        service.log(`Started listening`);
        service.log(this.socket.address());
        service.log(this.socket.remoteAddress());
    }

    getIPv4(address)
    {
        const ipv4Pattern = /(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)\.(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)\.(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)\.(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)/;
        const match = address.match(ipv4Pattern);
        return match ? match[0] : null;
    }

    negotiate()
    {
        this.lastQueue = 0;
        this.shouldNegotiate = true;
        this.negotiationAttempts = 0;
    }

    handleQueue(now)
    {
        if (now - this.lastQueue > 5000)
        {
            if (this.shouldNegotiate)
            {
                this.lastQueue = Date.now();
                this.negotiationAttempts++;
                this.broadcastNegotiation();

                if (this.negotiationAttempts >= 5)
                {
                    // We should no longer try, until a new device is added
                    this.shouldNegotiate = false;
                    this.negotiationAttempts = 0;
                }
            }
        }
    }

    broadcastNegotiation()
    {
        let devices = [];
        for (const crcId of Object.keys(this.devices))
        {
            let device = this.devices[crcId];
            if (!device.initialized && device.localKey)
            {
                devices.push(device);
            }
        }

        // If there are no devices, return
        if (devices.length === 0)
        {
            this.shouldNegotiate
            return;
        }

        service.log('Starting negotiation broadcast');

        // Split the devices in broadcasts of max 5 devices;
        let deviceSplit = Math.ceil(devices.length / 5);
        while (deviceSplit > 0)
        {
            let deviceBatch = devices.splice(0, 5);
            this.negotiateDevice(deviceBatch);
            deviceSplit--;
        }
    }

    negotiateDevice(deviceBatchData)
    {
        // Create random nonce in hex
        const nonce = this.randomHexBytes(12);

        // Data generated for each device is set to a fixed 36 byte length
        // In addition the device crc id (4byte) + length (4byte) + tag (16byte) = 24 bytes
        let dataLength = (36 + 24) * deviceBatchData.length;
        let aad = this.createAad(deviceBatchData, dataLength, this.type.negotiationRequest);

        let negotiationMessage = ''
        for (const device of deviceBatchData)
        {
            negotiationMessage += this.createNegotiatonRequest(device, aad, nonce);
        }

        let finalMessage = this.header;
            finalMessage += aad;
            finalMessage += nonce;
            finalMessage += negotiationMessage;
            finalMessage += this.tail;

        if (this.broadcastIp)
        {
            service.log(`Broadcasting (${this.broadcastIp}) the negotiation: ${finalMessage}`);
            this.socket.write(this.byteArrayFromHex(finalMessage), this.broadcastIp, this.port);
        }
    }

    getSequenceNumber()
    {
        let sequenceNum = this.currentSequence.toString(16);
        if (this.currentSequence >= 0xffffffff)
        {
            this.currentSequence = 0x01;
        } else
        {
            this.currentSequence++;
        }
        return this.getW32FromHex(sequenceNum, 4);
    }

    createAad(data, length, type)
    {
        const sequence = this.getSequenceNumber();
        const totalLength = this.getW32FromHex( (this.dataLength + length).toString(16), 4);
        const frameNum = this.getW32FromHex(data.length, 4);

        let aad = '';
        aad += this.versionReserved;
        aad += this.reserved;
        aad += sequence.toString(Hex);
        aad += type;
        aad += this.crc.toString(16);
        aad += totalLength.toString(Hex);
        aad += frameNum.toString(Hex);

        return aad;
    }

    createNegotiatonRequest(device, aad, nonce)
    {
        let deviceData = device.getNegotiationData();
        const [encodedData, tag] = this.encryptGCM(deviceData, nonce, aad, this.key);

        service.log('Using device crc: ' + device.crc);

        let negotiationRequest = device.crc;
            negotiationRequest += this.getW32FromHex((encodedData.length/2).toString(16), 4).toString(Hex);
            negotiationRequest += encodedData;
            negotiationRequest += tag;

        return negotiationRequest;
    }

    encryptGCM(sourceData, nonce, aad, key)
    {
        key = Hex.parse(key);
        nonce = Hex.parse(nonce);

        let payload = Hex.parse(sourceData);
        let authData = Utf8.parse(aad);

        let encryptedData = AES.encrypt(payload, key, {iv: nonce, mode: GCM});

        let cipherText = encryptedData.cipherText;
        let tagLength = 16;

        let authTag = GCM.mac(AES, key, nonce, authData, cipherText, tagLength);
      
        // Convert base 64 data to hex
        let decodedEncryptedData = Base64.parse(encryptedData.toString()).toString(Hex);

        return [decodedEncryptedData, authTag.toString(Hex)];
    }

    onPacketReceived(packet)
    {
        let data = new Uint8Array(packet.buffer);
        if (data.length < 64) return;

        // let byteArray = this.byteArrayFromHex(data);
        // Razer message:
        let message = new TuyaMessage(data);
        if (message.isValid())
        {
            let messageCrc = this.byteArrayToHex(message.crc);

            // If it's just the broadcast message we just sent ourselves
            if (messageCrc == this.crc.toString(16)) return;

            if (this.byteArrayToHex(message.type) === this.type.negotiationResponse)
            {
                service.log(`Looking for device with crc ${messageCrc}`);
            }
        }
    }
}