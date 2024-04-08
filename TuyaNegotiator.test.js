import BaseClass from './BaseClass.test.js';
import DeviceList from './DeviceList.test.js';

export default class TuyaNegotiator extends BaseClass
{
    constructor()
    {
        super();
        this.port = 40001;
        this.socket = udp.createSocket();

        this.uuid = this.getUUID();
        this.crc = this.getCrc();

        this.init();
    }

    init()
    {
        this.socket.bind(this.port);
        this.socket.on('message', this.handleNegotiation.bind(this));
        this.socket.on('error', service.log);
    }

    getUUID()
    {
        return '420691337420b00b'; // We could randomize this if needed
    }

    getCrc()
    {
        let uuid = this.getByteDataFromLen(25, this.getHexFromString(this.uuid), true);
        let crcId = crc32(Buffer.from(uuid + '00', 'hex'));
        return crcId;
    }

    
}