import { Utf8 } from "./lib/encoder/Utf8.test.js";
import { Word32Array } from "./lib/Word32Array.test.js";
import { AES } from "./AES.test.js";
import { CCM } from "./mode/CCM.test.js";
export function CBCMAC(plainText, associatedData, key, iv, tagLength, props) {
    const Cipher = (props && props.Cipher) ? props.Cipher : AES;
    const K = typeof key === "string" ? Utf8.parse(key) : key;
    const N = iv ? iv : new Word32Array([0, 0]);
    const A = typeof associatedData === "string" ? Utf8.parse(associatedData) : associatedData;
    const P = typeof plainText === "string" ? Utf8.parse(plainText) : plainText;
    const t = tagLength || 16;
    return CCM.mac(Cipher, K, N, A, P, t);
}
