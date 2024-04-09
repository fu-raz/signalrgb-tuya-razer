import BaseClass from './Libs/BaseClass.test.js';
import DeviceList from './Data/DeviceList.test.js';

export default class TuyaController extends BaseClass
{
    constructor(tuyaDevice)
    {
        super();
        this.id = tuyaDevice.id;
        this.tuyaDevice = tuyaDevice;
        this.deviceList = this.getDevices();
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
        return this.tuyaDevice.validateDeviceUpdate(enabled, deviceType, localKey);
    }

    updateDevice(enabled, deviceType, localKey)
    {
        this.tuyaDevice.updateDevice(enabled, deviceType, localKey);

        // Controller should already exist, but check anyway
        if (service.hasController(this.id))
        {
            service.updateController(this);
        }
    }
            
}