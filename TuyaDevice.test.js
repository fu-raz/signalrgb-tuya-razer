import BaseClass from './Libs/BaseClass.test.js';
import DeviceList from './Data/DeviceList.test.js';
import crc32 from './Libs/CRC32.test.js';
import {Word32Array} from './Crypto/Word32Array.test.js';
import {Hex} from './Crypto/Hex.test.js';

export default class TuyaDevice extends BaseClass
{
    constructor(deviceData, crc)
    {
        super();

        this.id             = deviceData.gwId;
        const deviceJson    = service.getSetting(this.id, 'data');
        if (deviceJson)
        {
            deviceData = JSON.parse(deviceJson);
        }

        this.enabled        = deviceData.hasOwnProperty('enabled') ? deviceData.enabled : false;
        this.deviceType     = deviceData.hasOwnProperty('deviceType') ? deviceData.deviceType : 0;
        this.localKey       = deviceData.hasOwnProperty('localKey') ? deviceData.localKey : null;

        this.name           = this.getName();

        this.ip             = deviceData.ip;
        this.uuid           = deviceData.uuid;
        this.gwId           = deviceData.gwId;
        this.version        = deviceData.version;
        this.productKey     = deviceData.productKey;

        this.token          = this.getToken(deviceData, 'token');
        this.rnd            = this.getToken(deviceData, 'rnd');
        this.crc            = this.calculateCrc(crc);

        this.negotiationKey = deviceData.hasOwnProperty('negotiationKey') ? deviceData.negotiationKey : null;
        this.sessionKey     = deviceData.hasOwnProperty('sessionKey') ? deviceData.sessionKey : null;

        this.initialized    = false;
    }

    getName()
    {   
        if (this.deviceType !== 0)
        {
            service.log(`Trying to find device ${this.deviceType}`);
            return `${DeviceList[this.deviceType].name} - ${this.id}`;
        }

        return `Tuya device ${this.id}`;
    }

    getToken(deviceData, name)
    {
        if (deviceData.hasOwnProperty(name))
        {
            if (deviceData[name].length == 32)
            {
                return deviceData[name];
            }
        }
        return this.randomHexBytes(16);
    }

    getLedNames()
    {
        let ledNames = [];
        for (let i = 1; i <= this.tuyaLeds.length; i++)
        {
            ledNames.push(`Led ${i}`);
        }
        return ledNames;
    }

    getLedPositions()
    {
        let ledPositions = [];
        for (let i = 0; i < this.tuyaLeds.length; i++)
        {
            ledPositions.push([i, 0]);
        }
        return ledPositions;
    }

    setupDevice()
    {
        this.ledNames = this.getLedNames();
        this.ledPositions = this.getLedPositions();
        this.tuyaLeds = DeviceList[this.deviceType].leds;

        device.setName(this.deviceData.name);
        device.setSize([this.tuyaLeds.length, 1]);
        device.setControllableLeds(this.ledNames, this.ledPositions);
    }

    render(lightingMode, forcedColor, now)
    {
        switch(lightingMode)
        {
            case "Canvas":
                let RGBData = this.getDeviceRGB();
                // this.goveeDevice.sendRGB(RGBData, now, frameDelay);
                break;
            case "Forced":
                
                break;
        }
    }

    validateDeviceUpdate(enabled, deviceType, localKey)
    {
        let shouldSave = false;
        if (this.enabled !== enabled)
        {
            shouldSave = true;
        }

        if (this.deviceType !== deviceType)
        {
            shouldSave = true;
        }

        if (this.localKey !== localKey)
        {
            shouldSave = true;
        }

        return shouldSave;
    }

    updateDevice(enabled, deviceType, localKey)
    {
        if (this.validateDeviceUpdate(enabled, deviceType, localKey))
        {
            this.enabled = enabled;
            this.deviceType = deviceType;
            this.localKey = localKey;
            this.saveToCache();
        }
    }

    calculateCrc(crc)
    {
        let hexString = this.zeroPad(this.hexFromString(this.id), 50, true);
        let deviceCrcW32 = Hex.parse(hexString + '00');
        let crcW32 = Hex.parse(crc.toString(16));

        deviceCrcW32.concat(crcW32);

        let crcId = crc32(deviceCrcW32.toUint8Array());
        let strCrc = crcId.toString(16);

        return strCrc;
    }

    getNegotiationData()
    {
        const negotiatonHeader = '00000000';
        return negotiatonHeader + this.token + this.rnd;
    }

    startSession(sessionKey, negotiationKey)
    {
        service.log('Keys successfully negotiated, saving and starting session');
        this.sessionKey = sessionKey;
        this.negotiationKey = negotiationKey;

        this.initialized = true;
        
        this.saveToCache();
    }

    toJson()
    {
        return {
            id: this.id,
            name: this.name,
            enabled: this.enabled,
            ip: this.ip,
            uuid: this.uuid,
            gwId: this.gwId,
            version: this.version,
            productKey: this.productKey,
            deviceType: this.deviceType,
            localKey: this.localKey,
            token: this.token,
            rnd: this.rnd,
            crc: this.crc,
            negotiationKey: this.negotiationKey,
            sessionKey: this.sessionKey,
        };
    }

    saveToCache()
    {
        service.log('Saving to cache');
        service.saveSetting(this.id, 'data', JSON.stringify(this.toJson()));
        // let ipCache = {};
        // const ipCacheJSON = service.getSetting('ipCache', 'cache');
        // if (ipCacheJSON) ipCache = JSON.parse(ipCacheJSON);

        // ipCache[this.gwId] = this.toJson();
        // service.saveSetting('ipCache', 'cache', JSON.stringify(ipCache));

        // service.log('Saved data');
        // service.log(this.toJson());
    }
}