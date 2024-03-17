import { Hmac } from "./Hmac.test.js";
import { MD5 } from "./MD5.test.js";
export function HmacMD5(message, key) {
    return new Hmac(new MD5(), key).finalize(message);
}
