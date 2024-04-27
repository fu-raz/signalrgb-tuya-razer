import BaseClass from './BaseClass.test.js';
import { AES } from '../Crypto/AES.test.js';
import { GCM } from '../Crypto/mode/GCM.test.js';
import { Base64 } from '../Crypto/Base64.test.js';
import { Hex } from '../Crypto/Hex.test.js';

export default class TuyaEncryptor extends BaseClass
{
    constructor()
    {
        super();

        this.broadcastPort = 40001;
        this.broadcastIp = null;

        this.currentSequence = 0x01;
        this.dataLength = 42;
        
        this.messageType = {
            negotiationRequest  : '00000005',
            negotiationResponse : '00000006',
            command             : '00000010'
        };

        this.header = '00006699';
        this.versionReserved = '00';
        this.reserved = '00';
        this.key = '6f36045d84b042e01e29b7c819e37cf7';
        this.tail = '00009966';
    }

    setBroadcastIp(ipAddress)
    {
        let parts = ipAddress.split('.');
        parts[3] = '255';
        this.broadcastIp = parts.join('.');
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

    createAad(data, dataLength, type, crc)
    {
        const sequence = this.getSequenceNumber();
        const totalLength = this.getW32FromHex( (this.dataLength + dataLength).toString(16), 4);
        const frameNum = this.getW32FromHex(data.length, 4);

        if (!crc) crc = this.crc;

        let aad = '';
        aad += this.versionReserved;
        aad += this.reserved;
        aad += sequence.toString(Hex);
        aad += type;
        aad += crc.toString(16);
        aad += totalLength.toString(Hex);
        aad += frameNum.toString(Hex);

        return aad;
    }

    encryptGCM(sourceData, nonce, aad, key)
    {
        key = Hex.parse(key);
        nonce = Hex.parse(nonce);

        let payload = Hex.parse(sourceData);

        let encryptedData = AES.encrypt(payload, key, {iv: nonce, mode: GCM});

        let cipherText = encryptedData.cipherText;
        let tagLength = 16;

        let decodedEncryptedData = Base64.parse(encryptedData.toString()).toString(Hex);

        if (aad)
        {
            let authData = Hex.parse(aad);
            let authTag = GCM.mac(AES, key, nonce, authData, cipherText, tagLength);

            return [decodedEncryptedData, authTag.toString(Hex)];
        } else
        {
            return [decodedEncryptedData, null];
        }
    }

    decryptGCM(sourceData, nonce, aad, key, tag)
    {
        nonce = Hex.parse(nonce);
        aad = Hex.parse(aad);
        key = Hex.parse(key);
        tag = Hex.parse(tag);

        let payload = Hex.parse(sourceData);

        var authtag = GCM.mac(AES, key, nonce, aad, payload);

        // Let's see if the data is correct
        if (authtag.toString() !== tag.toString())
        {
            service.log('Auth tag doesn\'t match supplied tag');
            return [false, null];
        }

        const decrypted = AES.decrypt(payload.toString(Base64), key, {iv: nonce, mode: GCM});
        return [true, decrypted];
    }
}