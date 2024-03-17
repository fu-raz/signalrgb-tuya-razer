import TuyaBroadcast from './TuyaBroadcast.test.js';

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

export function Initialize()
{
}

export function Update()
{

}

export function Render()
{
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
    this.timeSinceLastReq = 0;

    this.Initialize = function()
    {
        this.broadcast = new TuyaBroadcast();
        this.broadcast.on('broadcast.device', this.handleTuyaDiscovery.bind(this));
    }

    this.Update = function()
    {
    }

    this.Discovered = function(receivedPacket)
    {
    }

    this.handleTuyaDiscovery = function(data)
    {
        service.log(data);
    }
}
