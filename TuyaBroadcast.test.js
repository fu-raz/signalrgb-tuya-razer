import udp from "@SignalRGB/udp";
import BaseClass from './BaseClass.test.js';
import { MD5 } from './Crypto/MD5.test.js';
import { AES } from "./Crypto/AES.test.js";
import { Hex } from "./Crypto/lib/encoder/Hex.test.js";
import { GCM } from "./Crypto/lib/algorithm/cipher/mode/GCM.test.js";
import { Utf8 } from "./Crypto/lib/encoder/Utf8.test.js";

export default class TuyaBroadcast extends BaseClass
{
    constructor()
    {
        super();
        this.port = 6667;
        this.key = Hex.parse(MD5.hash('yGAdlopoPVldABfn').toString());
        this.socket = udp.createSocket();
        this.init();
    }

    init()
    {
        this.socket.bind(this.port);
        this.socket.on('message', this.handleBroadcast.bind(this));
    }

    stringToBytesUTF8(str) {
        var bytes = [];
        for (var i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i);
            if (charCode < 0x80) { // 1-byte characters
                bytes.push(charCode);
            } else if (charCode < 0x800) { // 2-byte characters
                bytes.push(0xc0 | (charCode >> 6),
                           0x80 | (charCode & 0x3f));
            } else if (charCode < 0xd800 || charCode >= 0xe000) { // 3-byte characters
                bytes.push(0xe0 | (charCode >> 12),
                           0x80 | ((charCode >> 6) & 0x3f),
                           0x80 | (charCode & 0x3f));
            } else { // 4-byte characters (surrogate pairs)
                i++; // get the next character
                // UTF-16 encodes 0x10000-0x10FFFF by subtracting 0x10000 and splitting the
                // 20 bits of 0x0-0xFFFFF into two halves
                var code = 0x10000 + (((charCode & 0x3ff) << 10)
                        | (str.charCodeAt(i) & 0x3ff));
                bytes.push(0xf0 | (code >> 18),
                           0x80 | ((code >> 12) & 0x3f),
                           0x80 | ((code >> 6) & 0x3f),
                           0x80 | (code & 0x3f));
            }
        }
        return bytes;
    }

    stringToBytesUTF16(str) {
        var bytes = [];
        for (var i = 0; i < str.length; i++) {
            var codeUnit = str.charCodeAt(i);
            bytes.push(codeUnit & 0xFF); // Low byte
            bytes.push(codeUnit >> 8);   // High byte
        }
        return bytes;
    }

    stringToBytesLatin1(str) {
        var bytes = [];
        for (var i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i);
            if (charCode > 0xFF) {
                console.warn("Character code at position " + i + " exceeds Latin1 range");
            }
            bytes.push(charCode & 0xFF);
        }
        return bytes;
    }

    equals(a, b)
    {
        if (a === b) return true; // checks if both references point to the same object
        if (a == null || b == null) return false; // checks if one of the arrays is null
        if (a.length !== b.length) return false; // arrays with different lengths are not equal
    
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false; // as soon as a non-matching element is found, return false
        }
        return true; // if none of the above conditions are met, the arrays are considered equal
    }

    handleBroadcast(message)
    {
        const data = this.stringToBytesUTF8(message.data);
        const prefix = data.slice(0, 4);
        let decryptedData = null;

        if (this.equals(prefix, [0x00, 0x00, 0x55, 0xAA])) // Protocol up to 3.3
        {
            service.log('Old device detected');
            // decryptedData = this.decryptECB(data);
        } else if (this.equals(prefix, [0x00, 0x00, 0x66, 0x99])) // Protocol 3.4+
        {
            service.log('New device detected');
            // decryptedData = this.decryptGCM(data);
        } else
        {
            service.log('Unknown protocol');
            service.log(prefix);
            service.log('Old device header:');
            service.log([0x00, 0x00, 0x66, 0x99]);
            service.log('New device header:');
            service.log([0x00, 0x00, 0x55, 0xAA]);
            service.log('------------------------------');
        }

        if (decryptedData)
        {
            
            this.trigger('broadcast.device', decryptedData, rinfo);
        }
    }

    decryptECB(data)
    {
        // Create a decipher object using AES algorithm and ECB mode
        const decipher = crypto.createDecipheriv('aes-128-ecb', this.key, '');
    
        // Decrypt the message
        let decrypted = decipher.update(data.slice(20, -8), undefined, 'utf8');
        decrypted += decipher.final('utf8');
    
        // Unpad the decrypted message
        return JSON.parse(decrypted);
    }

    decryptGCM(data)
    {
        const header = Hex.parse(data.slice(4, 18));
        const iv = Hex.parse(data.slice(18, 30));
        const payload = Hex.parse(data.slice(30, -20));
        const tag = Hex.parse(data.slice(-20,-4));

        var decrypted = AES.decrypt(payload, this.key, {iv, mode: GCM});

        service.log(decrypted.toString());
        // const decipher = crypto.createDecipheriv('aes-128-gcm', this.key, iv);
        // decipher.setAuthTag(tag);
        // decipher.setAAD(header);
        // const decrypted = Buffer.concat([decipher.update(payload), decipher.final()]);


        try {
            return JSON.parse(decrypted.slice(4).toString());
        } catch(ex)
        {
            service.error(decrypted);
            service.error(ex);
        }
    }
}