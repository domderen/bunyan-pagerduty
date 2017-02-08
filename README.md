# bunyan-pagerduty
[![bunyan-pagerduty](http://img.shields.io/npm/v/bunyan-pagerduty.svg?style=flat-square)](https://www.npmjs.com/package/bunyan-pagerduty)
[![bunyan-pagerduty](http://img.shields.io/npm/dm/bunyan-pagerduty.svg?style=flat-square)](https://www.npmjs.com/package/bunyan-pagerduty)
[![bunyan-pagerduty](http://img.shields.io/npm/l/bunyan-pagerduty.svg?style=flat-square)](https://www.npmjs.com/package/bunyan-pagerduty)
[![Build Status](https://img.shields.io/travis/qualitybath/bunyan-pagerduty.svg?style=flat-square)](https://travis-ci.org/qualitybath/bunyan-pagerduty)
[![Coveralls](https://img.shields.io/coveralls/qualitybath/bunyan-pagerduty.svg?style=flat-square)](https://coveralls.io/r/qualitybath/bunyan-pagerduty)
[![code climate](https://img.shields.io/codeclimate/github/qualitybath/bunyan-pagerduty.svg?style=flat-square)](https://codeclimate.com/github/qualitybath/bunyan-pagerduty)

**Bunyan stream for PagerDuty chat integration**

First install bunyan...

```
npm install bunyan
```

Then install bunyan-pagerduty

```
npm install bunyan-pagerduty
```

##Basic Setup

```javascript
var bunyan  = require("bunyan"),
	BunyanPagerDuty = require('bunyan-pagerduty'),
	log;

log = bunyan.createLogger({
	name: "myApp",
	stream: new BunyanPagerDuty({
		service_key: "myservicekey",
	}),
	level: "error"
});

log.error("hello bunyan PD");
```
You can also pass an optional error handler.

```javascript
new BunyanPagerDuty({
	service_key: "myservicekey",
}, function(error){
	console.log(error);
});
```

##Custom Formatters

By default the logs are formatted like so: `[LOG_LEVEL] message`, unless you specify a `customFormatter` function.

```javascript
	log = bunyan.createLogger({
	name: "myApp",
	stream: new BunyanPagerDuty({
		service_key: "myservicekey",
		customFormatter: function(record, levelName){
			return {description: "[" + levelName + "] " + record.msg }
		}
	}),
	level: "error"
});
```
##Custom Formatter Options
> Check the [PagerDuty docs](https://v2.developer.pagerduty.com/docs/trigger-events) for custom formatter options.

###Putting it all together
```javascript
var bunyan  = require("bunyan"),
	BunyanPagerDuty = require('bunyan-pagerduty'),
	log;

log = bunyan.createLogger({
	name: 'myapp',
	stream: new BunyanPagerDuty({
		service_key: "myservicekey",
		customFormatter: function(record, levelName) {
			return {
				description: `[${levelName}] ${record.msg}`,
        details: record,
        client: 'My Client Name',
        incident_key: 'Unique incident key',
        client_url: 'https://some.custom.url.com',
        contexts: [
          {
            type: "link",
            href: "http://acme.pagerduty.com"
          },{
            type: "link",
            href: "http://acme.pagerduty.com",
            text: "View the incident on PagerDuty"
          },{
            type: "image",
            src: "https://chart.googleapis.com/chart?chs=600x400&chd=t:6,2,9,5,2,5,7,4,8,2,1&cht=lc&chds=a&chxt=y&chm=D,0033FF,0,0,5,1"
          }
        ]
			};
		}
	}),
	level: 'error'
});
```

***
This library was adapted from  [bunyan-slack](https://github.com/qualitybath/bunyan-slack)

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
