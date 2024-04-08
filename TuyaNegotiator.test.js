import udp from "@SignalRGB/udp";

import BaseClass from './BaseClass.test.js';
import DeviceList from './DeviceList.test.js';

import { Hex } from './Crypto/Hex.test.js';

export default class TuyaNegotiator extends BaseClass
{
    constructor()
    {
        super();
        this.port = 40001;
        this.socket = udp.createSocket();

        this.uuid = this.getUUID();
        this.crc = this.getCrc(this.uuid);

        this.init();
    }

    init()
    {
        this.socket.bind(this.port);
        // this.socket.on('message', this.handleNegotiation.bind(this));
        this.socket.on('error', service.log);
    }

    getUUID()
    {
        return '420691337420b00b'; // We could randomize this if needed
    }

    getCrc(uuid)
    {
        let uuidBuffer = Hex.parse(uuid);
        if (uuidBuffer.nSigBytes < 25)
        {
            for (let i = (25 - uuidBuffer.nSigBytes); i < 25; i++)
            {
                uuidBuffer.concat([0]);
            }
        }
        service.log(uuidBuffer.toUint8Array());
        service.log(uuidBuffer);
        return null;
    }
}