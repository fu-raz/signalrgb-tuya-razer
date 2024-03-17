import { Hmac } from "./Hmac.test.js";
import { SHA384 } from "./SHA384.test.js";
export function HmacSHA384(message, key) {
    return new Hmac(new SHA384(), key).finalize(message);
}
