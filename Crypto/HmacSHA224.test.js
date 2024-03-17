import { Hmac } from "./Hmac.test.js";
import { SHA224 } from "./SHA224.test.js";
export function HmacSHA224(message, key) {
    return new Hmac(new SHA224(), key).finalize(message);
}
