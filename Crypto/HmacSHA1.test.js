import { Hmac } from "./Hmac.test.js";
import { SHA1 } from "./SHA1.test.js";
export function HmacSHA1(message, key) {
    return new Hmac(new SHA1(), key).finalize(message);
}
