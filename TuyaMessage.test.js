import { Hex } from "./Crypto/Hex.test.js";
import BaseClass from "./Libs/BaseClass.test.js";
import { Word32Array } from './Crypto/Word32Array.test.js';

export default class TuyaMessage extends BaseClass
{
    constructor(data)
    {
        super();
        this.validHeader = Hex.parse('00006699').toUint8Array();
        this.validTail = Hex.parse('00009966').toUint8Array();

        if (data)
        {
            this.header = data.slice(0, 4);
            this.aad = data.slice(4, 26);
            this.type = data.slice(10, 14);
            this.crc = data.slice(14, 18);
            
            this.nonce = data.slice(26, 38);
            this.length = data.slice(42, 46);
            this.encryptedData = data.slice(46, 46 + parseInt(this.length.toString("hex"), 16));
            this.tag = data.slice(46 + parseInt(this.length.toString("hex"), 16), data.length - 4);
            this.tail = data.slice(data.length - 4, data.length);
        }
    }

    isValid()
    {
        return (
            this.equals(this.validHeader, this.header) &&
            this.equals(this.validTail, this.tail)
        );
    }
}