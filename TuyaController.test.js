import BaseClass from './BaseClass.test.js';
import DeviceList from './DeviceList.test.js';

export default class TuyaController extends BaseClass
{
    constructor(deviceData)
    {
        super();
        this.deviceList = this.getDevices();

        this.enabled = deviceData.hasOwnProperty('enabled') ? deviceData.enabled : false;
        this.deviceType = deviceData.hasOwnProperty('deviceType') ? deviceData.deviceType : 0;
        this.localKey = deviceData.hasOwnProperty('localKey') ? deviceData.localKey : null;

        this.id = deviceData.gwId;
        this.name = this.getName();

        this.ip = deviceData.ip;
        this.uuid = deviceData.uuid;
        this.gwId = deviceData.gwId;
        this.version = deviceData.version;
        this.productKey = deviceData.productKey;
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

    getDevices()
    {
        let devices = [
            { key: 0, deviceName: 'Select device type' }
        ];
        let keys = Object.keys(DeviceList);
        for (const key of keys)
        {
            devices.push({ key: key, deviceName: DeviceList[key].name });
        }
        return devices;
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

            // Controller should already exist, but check anyway
            if (service.hasController(this.id))
            {
                service.updateController(this);
            }
        }
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
            localKey: this.localKey
        };
    }

    saveToCache()
    {
        service.log('Saving to cache');
        let ipCache = {};
        const ipCacheJSON = service.getSetting('ipCache', 'cache');
        if (ipCacheJSON) ipCache = JSON.parse(ipCacheJSON);

        ipCache[this.gwId] = this.toJson();
        service.saveSetting('ipCache', 'cache', JSON.stringify(ipCache));

        service.log('Saved data');
        service.log(this.toJson());
    }
}