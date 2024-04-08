import BaseClass from './BaseClass.test.js';
import DeviceList from './DeviceList.test.js';

export default class TuyaDevice extends BaseClass
{
    constructor(deviceData)
    {
        super();
        this.deviceData = deviceData;
        this.tuyaLeds = DeviceList[this.deviceData.type].leds;

        this.ledNames = this.getLedNames();
        this.ledPositions = this.getLedPositions();

        this.setupDevice();
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
}