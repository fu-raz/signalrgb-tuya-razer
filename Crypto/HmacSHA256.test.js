import { Hmac } from "./Hmac.test.js";
import { SHA256 } from "./SHA256.test.js";
export function HmacSHA256(message, key) {
    return new Hmac(new SHA256(), key).finalize(message);
}
