import { HmacSHA256 } from './Crypto/HmacSHA256.test.js';
import { Hex } from './Crypto/Hex.test.js';
import BaseClass from './Libs/BaseClass.test.js';
import { Word32Array } from './Crypto/Word32Array.test.js';

export default class TuyaNegotiationMessage extends BaseClass
{
    constructor(hexMessageData)
    {
        super();

        const byteArray = hexMessageData.toUint8Array();

        this.rndB = byteArray.slice(0, 16);
        this.rndHmac = byteArray.slice(16, 48);
        this.sessionKeyHmac = byteArray.slice(48, byteArray.length);
    }

    verifyNegotiationKey(deviceRnd, negotiationKey)
    {
        // generate hmac from device rnd and negotiation key
        const localRndHmac = HmacSHA256(deviceRnd, negotiationKey);
        const sessionRndHmac = new Word32Array(this.rndHmac);

        return localRndHmac.equals(sessionRndHmac);

    }

    verifySessionKey(sessionKey, negotiationKey)
    {
        // generate hmac from device rnd and negotiation key
        const localSessionHmac = HmacSHA256(sessionKey, negotiationKey);
        const sessionSessionHmac = new Word32Array(this.sessionKeyHmac);
        
        service.log('Session hmac: ' + sessionSessionHmac.toString(Hex));
        service.log('Should be   : ' + localSessionHmac.toString(Hex));
        return localSessionHmac.equals(sessionSessionHmac);
    }

    generateSessionToken(deviceRnd)
    {
        return deviceRnd.xor( new Word32Array(this.rndB) );
    }
}