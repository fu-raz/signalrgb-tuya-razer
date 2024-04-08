import TuyaBroadcast from './TuyaBroadcast.test.js';
import TuyaController from './TuyaController.test.js';
import TuyaDevice from './TuyaDevice.test.js';
import TuyaNegotiator from './TuyaNegotiator.test.js';

/* ---------- */
/*   DEVICE   */
/* ---------- */
export function Name() { return "Tuya Razer"; }
export function Version() { return "0.0.1"; }
export function Type() { return "network"; }
export function Publisher() { return "RickOfficial"; }
export function Size() { return [1, 1]; }
export function DefaultPosition() {return [0, 70]; }
export function DefaultScale(){return 1.0;}
export function ControllableParameters()
{
	return [
		{"property":"lightingMode", "group":"settings", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"settings", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"turnOff", "group":"settings", "label":"On shutdown", "type":"combobox", "values":["Do nothing", "Single color", "Turn device off"], "default":"Turn device off"},
        {"property":"shutDownColor", "group":"settings", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#8000FF"}
	];
}

let tuyaDevice;

export function Initialize()
{
    if (controller.enabled)
    {
        // Here we create the device
        tuyaDevice = new TuyaDevice(controller.toJson());
    }
}

export function Update()
{

}

export function Render()
{
    let now = Date.now();
    tuyaDevice.render(lightingMode, forcedColor, now);
}

export function Shutdown()
{
}

export function Validate()
{
    return true;
}

/* ------------- */
/*   DISCOVERY   */
/* ------------- */
export function DiscoveryService()
{
    this.ipCache = {};

    this.lastPollTime = -5000;
    this.PollInterval = 5000;

    this.devicesLoaded = false;

    this.negotiator = null;

    this.Initialize = function()
    {
        this.broadcast = new TuyaBroadcast();
        this.broadcast.on('broadcast.device', this.handleTuyaDiscovery.bind(this));

        let ipCacheJSON = service.getSetting('ipCache', 'cache');
        if (ipCacheJSON) this.ipCache = JSON.parse(ipCacheJSON);

        this.negotiator = new TuyaNegotiator();
    }

    this.handleTuyaDiscovery = function(data)
    {
        let deviceData = data;

        // Try to find cached data
        if (this.ipCache.hasOwnProperty(data.gwId))
        {
            // If we have cached data, use the cached data
            deviceData = this.ipCache[data.gwId];
            // Set a new ip if it no longer matches
            if (deviceData.ip !== data.ip) deviceData.ip = data.ip;
        }

        // Check if there's already a controller with this id
        if (!service.hasController(deviceData.gwId))
        {
            service.log('Creating controller for ' + deviceData.gwId);
            try {
                let controller = new TuyaController(deviceData);
                controller.saveToCache();

                service.addController(controller);
                if (controller.enabled) service.announceController(controller);
            } catch(ex)
            {
                service.log(ex.message);
            }
        }
    }

    this.Update = function(force)
    {
        // Also not using this
    }

    this.Discovered = function(receivedPacket)
    {
        // We don't use this
    }
}
