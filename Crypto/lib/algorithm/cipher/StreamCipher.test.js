import { Cipher } from "./Cipher.test.js";
export class StreamCipher extends Cipher {
    constructor(props) {
        super(props);
        this._blockSize = 1;
    }
    _doFinalize() {
        return this._process(true);
    }
}
