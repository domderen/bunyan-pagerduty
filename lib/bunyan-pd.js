const util = require('util'),
request  = require('request'),
extend   = require('extend.js');

const PD_POST_URL = 'https://events.pagerduty.com/generic/2010-04-15/create_event.json';

function BunyanPagerDuty(options, error) {
	options = options || {};
	if (!options.service_key && !options.serviceKey) {
		throw new Error('Service key cannot be null');
	} else {
		this.customFormatter = options.customFormatter;
		this.service_key     = options.service_key || options.serviceKey;
		this.error           = error               || function() {};

		if (options.incident_key || options.incidentKey) {
			this.incident_key = options.incident_key || options.incidentKey;
		}
	}
}

var nameFromLevel = {
	10: 'trace',
	20: 'debug',
	30: 'info',
	40: 'warn',
	50: 'error',
	60: 'fatal'
};

BunyanPagerDuty.prototype.write = function write(record) {
	var self = this,
	levelName,
	message;

	if (typeof record === 'string') {
		record = JSON.parse(record);
	}

	levelName = nameFromLevel[record.level];

	try {
		message = self.customFormatter ? self.customFormatter(record, levelName) : {
			description: util.format('[%s] %s', levelName.toUpperCase(), record.msg),
			details: record,
			event_type: 'trigger'
		};
	} catch(err) {
		return self.error(err);
	}

	var base = {
		service_key: self.service_key,
		incident_key: self.incident_key
	};

	message = extend(base, message);

	request.post({
		url: PD_POST_URL,
		body: JSON.stringify(message)
	})
	.on('error', function(err) {
		return self.error(err);
	});
};

BunyanPagerDuty.PD_POST_URL = PD_POST_URL;

module.exports = BunyanPagerDuty;
