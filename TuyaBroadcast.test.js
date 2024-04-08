import udp from "@SignalRGB/udp";
import BaseClass from './BaseClass.test.js';
import { MD5 } from './Crypto/MD5.test.js';
import { AES } from "./Crypto/AES.test.js";
import { Hex } from "./Crypto/Hex.test.js";
import { Utf8 } from "./Crypto/Utf8.test.js";
import { GCM } from "./Crypto/lib/algorithm/cipher/mode/GCM.test.js";
import { Word32Array } from "./Crypto/lib/Word32Array.test.js";
import { OpenSSLFormatter } from "./Crypto/lib/algorithm/cipher/formatter/OpenSSLFormatter.test.js";
import { Base64 } from "./Crypto/lib/encoder/Base64.test.js";

export default class TuyaBroadcast extends BaseClass
{
    constructor()
    {
        super();
        this.port = 6667;
        this.key = MD5.hash('yGAdlopoPVldABfn');
        this.socket = udp.createSocket();
        this.init();
    }

    init()
    {
        this.socket.bind(this.port);
        this.socket.on('message', this.handleBroadcast.bind(this));
        this.socket.on('error', service.log);
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
        const data = new Uint8Array(message.buffer);
        const prefix = data.slice(0, 4);
        let tuyaDeviceData = false;

        if (this.equals(prefix, new Uint8Array([0x00, 0x00, 0x55, 0xAA]))) // Protocol up to 3.3
        {
            // service.log('Old device detected');
            // decryptedData = this.decryptECB(data);
        } else if (this.equals(prefix, new Uint8Array([0x00, 0x00, 0x66, 0x99]))) // Protocol 3.4+
        {
            tuyaDeviceData = this.decryptGCM(data);
        } else
        {
            service.log('Unknown protocol');
        }

        if (tuyaDeviceData)
        {
            
            this.trigger('broadcast.device', tuyaDeviceData);
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

    toHexString(byteArray)
    {
        const hex = Array.from(byteArray, function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
        return hex;
    }

    decryptGCM(data)
    {
        const aad = Hex.parse(this.toHexString(data.slice(4, 18)));
        const iv = Hex.parse(this.toHexString(data.slice(18, 30)));

        const payload = Hex.parse(this.toHexString(data.slice(30, -20)));
        const tag = this.toHexString(data.slice(-20,-4));

        try {
            var authtag = GCM.mac(AES, this.key, iv, aad, payload);

            // Let's see if the data is correct
            if (authtag.toString() !== tag.toString())
            {
                return false;
            }

            const decrypted = AES.decrypt(payload.toString(Base64), this.key, {iv: iv, mode: GCM});
            const byteArray = decrypted.toUint8Array();
            const jsonByteArray = new Word32Array(byteArray.slice(4));
            const JSONString = jsonByteArray.toString(Utf8);

            try {
                const jsonObject = JSON.parse(JSONString.trim());
                // service.log(jsonObject);
                return jsonObject;
            } catch(ex)
            {
                service.log('Error parsing string');
                service.log(ex);
            }
        } catch(ex)
        {
            service.log(ex);
        }

        return false;
    }
}