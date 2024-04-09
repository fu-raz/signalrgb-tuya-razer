import udp from "@SignalRGB/udp";

import BaseClass from './Libs/BaseClass.test.js';
import crc32 from './Libs/CRC32.test.js';
import { Word32Array } from "./Crypto/lib/Word32Array.test.js";

export default class TuyaNegotiator extends BaseClass
{
    constructor()
    {
        super();
        this.port = 40001;
        this.socket = udp.createSocket();

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

        this.init();
    }

    init()
    {
        this.socket.bind(this.port);
        this.socket.on('message', this.onPacketReceived.bind(this));
        this.socket.on('error', service.log);
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
        
        this.lastQueue = Date.now();
        this.shouldNegotiate = true;
        this.negotiationAttempts = 0;
    }

    handleQueue(now)
    {
        this.broadcastNegotiation();

        if (this.lastQueue + 5000 > now)
        {
            if (this.shouldNegotiate)
            {
                this.lastQueue = Date.now();
                this.negotiationAttempts++;
                this.broadcastNegotiation();

                if (this.negotiationAttempts >= 4)
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
        if (devices.length === 0) return;

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
        const nonce = this.randomBytes(12);
        // Data generated for each device is set to a fixed 36 byte length
        // In addition the device crc id (4byte) + length (4byte) + tag (16byte) = 24 bytes
        let dataLength = (36 + 24) * deviceBatchData.length;
        let aad = this.createAad(deviceBatchData, dataLength, this.type.negotiationRequest);

        let buffer = deviceBatchData.map((device) => {
            return this.createNegotiatonRequest(device, aad, nonce);
        });

        let finalData = Buffer.concat([
            this.header,
            aad,
            nonce,
            ...buffer,
            this.tail
        ]);

        // console.log('Broadcast', finalData.toString('hex'), this.broadcastIp, this.port);
        // this.socket.send(finalData, this.port, this.broadcastIp);
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
        return this.getByteDataFromLen(4, sequenceNum);
    }

    createAad(data, length, type)
    {
        const sequence = this.getSequenceNumber();
        const totalLength = this.getByteDataFromLen(4, (this.dataLength + length).toString(16));
        const frameNum = this.getByteDataFromLen(4, data.length);

        let aad = Buffer.concat([
            Buffer.from(this.versionReserved + this.reserved + sequence + type, 'hex'),
            this.crc,
            Buffer.from(totalLength + frameNum, 'hex')
        ]);

        return aad;
    }

    onPacketReceived(packet)
    {
        let data = new Uint8Array(packet.buffer);
        if (data.length < 64) return;

        // Razer message:
        let message = new TuyaMessage(data);
        if (message.isValid())
        {
            let messageCrc = new Word32Array(message.crc).toString(Hex);
            service.log(`Looking for device with crc ${messageCrc}`);

            // const device = this.findDeviceByCrc(message.crc.toString("hex"));
            // if (!device) return;

            // console.log('Response from', device.devId, device.ip, message.type);

            // if (message.type.equals(Buffer.from(this.type.negotiationResponse, 'hex')))
            // {
            //     this.handleNegotiationReponse(device, message);
            // }
        }
    }
}