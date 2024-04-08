import { Utf8 } from './Crypto/Utf8.test.js';
import { Hex } from './Crypto/Hex.test.js';

export default class BaseClass
{
    constructor()
    {
        this.events = {};
        this.anyEvents = [];
        this.singleEvents = {};
    }

    on(eventName, callback)
    {
        if (!this.events[eventName])
        {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    onAny(callback)
    {
        this.anyEvents.push(callback);
    }

    once(eventName, callback)
    {
        if (!this.singleEvents[eventName])
        {
            this.singleEvents[eventName] = [];
        }
        this.singleEvents[eventName].push(callback);
    }

    trigger(eventName)
    {
        if (this.events)
        {
            // First do all of the `onAny` events
            if (this.anyEvents.length > 0)
            {
                this.anyEvents.forEach((callback) => {
                    callback.apply(this, arguments);
                });
            }

            // Do the `on` events
            let events = this.events[eventName];
            if (events && events.length > 0)
            {
                [].shift.apply(arguments);
                events.forEach((callback) => {
                    callback.apply(this, arguments); // 'This' should get ignored by binded functions
                });
            }

            // Do the `once` events
            let oneTimeEvents = this.singleEvents[eventName];
            if (oneTimeEvents && oneTimeEvents.length > 0)
            {
                [].shift.apply(arguments);
                oneTimeEvents.forEach((callback) => {
                    callback.apply(this, arguments); // 'This' should get ignored by binded functions
                });
            }
        }
    }

    zeroPad(string, len)
    {
        let zeroPadded = "0".repeat(len) + string;
        return zeroPadded.slice(-len);
    }

    rgbToHsv(arr)
    {
        let h = 0;
        let s = 0;
        let v = 0;
        let r = arr[0];
        let g = arr[1];
        let b = arr[2];
        arr.sort(function (a, b) {
          return a - b;
        });
        var max = arr[2];
        var min = arr[0];
        v = max / 255;
        if (max === 0) {
          s = 0;
        } else {
          s = 1 - min / max;
        }
        if (max === min) {
          h = 0;
        } else if (max === r && g >= b) {
          h = 60 * ((g - b) / (max - min)) + 0;
        } else if (max === r && g < b) {
          h = 60 * ((g - b) / (max - min)) + 360;
        } else if (max === g) {
          h = 60 * ((b - r) / (max - min)) + 120;
        } else if (max === b) {
          h = 60 * ((r - g) / (max - min)) + 240;
        }
      
        h = parseInt(h);
        s = parseInt(s * 1000);
        v = parseInt(v * 1000);
        return [h, s, v];
    }
}