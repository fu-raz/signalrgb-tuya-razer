import { Hmac } from "./Hmac.test.js";
import { SHA512 } from "./SHA512.test.js";
export function HmacSHA512(message, key) {
    return new Hmac(new SHA512(), key).finalize(message);
}
