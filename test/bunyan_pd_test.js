var request = require('request'),
util        = require('util'),
sinon       = require('sinon'),
expect      = require('chai').expect,
Bunyan      = require('bunyan'),
BunyanPagerDuty = require('../lib/bunyan-pd'),
sandbox,
errorHandler;

describe('bunyan-pd', function() {
	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		errorHandler = sandbox.spy();
		sandbox.stub(request, 'post').returns({
			on: errorHandler
		});
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('constructor', function() {
		it('should require a service_key', function() {
			expect(function() {
				Bunyan.createLogger({
					name: 'myapp',
					stream: new BunyanPagerDuty({}),
					level: 'info'
				});
			}).to.throw(/Service key cannot be null/);
		});

		it('should set options', function() {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanPagerDuty({
					service_key: 'myservicekey',
          incident_key: 'someKey'
				}),
				level: 'info'
			});

			var expectedResponse = {
					body: JSON.stringify({
						description: '[INFO] foobar',
						service_key: 'myservicekey',
            incident_key: 'someKey',
						event_type: 'trigger',
						details: {
							msg: 'foobar',
						},
					}),
					url: BunyanPagerDuty.PD_POST_URL,
			};

			log.info('foobar');
			request.post.calledWithMatch(expectedResponse);
		});

		it('should use the custom formatter', function() {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanPagerDuty({
					service_key: 'myservicekey',
					incident_key: 'someKey',
					customFormatter: function(record, levelName) {
						return {
							description: record.msg,
							incident_key: 'someKey2',
							details: {
								level: levelName,
							}
						};
					}
				}),
				level: 'info'
			});

			var expectedResponse = {
					body: JSON.stringify({
						description: 'foobar',
						service_key: 'myservicekey',
						incident_key: 'someKey2',
						event_type: 'trigger',
						details: {
							level: 'INFO',
						},
					}),
					url: BunyanPagerDuty.PD_POST_URL
			};

			log.info('foobar');
			request.post.calledWith(expectedResponse);
		});
	});

	describe('error handler', function() {
		it('should use error handler', function(done) {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanPagerDuty({
					service_key: 'myservicekey',
					customFormatter: function(record, levelName) {
						return record.foo();
					}
				}, function(error) {
					expect(error).to.instanceof(TypeError);
					done();
				}),
				level: 'info'
			});
			log.info('foobar');
		});

		it('should use request error handler', function(done) {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanPagerDuty({
					service_key: 'myservicekey',
				}, function(error) {
					expect(error).to.eql('FAKE ERROR');
					done();
				}),
				level: 'info'
			});
			log.info('foobar');
			errorHandler.firstCall.args[1]('FAKE ERROR');
		});
	});

	describe('loggger arguments', function() {
		it('should accept a single string argument', function() {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanPagerDuty({
					service_key: 'myservicekey',
				}),
				level: 'info'
			});

			var expectedResponse = {
					body: JSON.stringify({
						description: '[INFO] foobar',
						service_key: 'myservicekey',
						event_type: 'trigger',
						details: {
							msg: 'foobar',
						},
					}),
					url: BunyanPagerDuty.PD_POST_URL,
			};

			log.info('foobar');
			request.post.calledWithMatch(expectedResponse);
		});

		it('should accept a single object argument', function() {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanPagerDuty({
					service_key: 'myservicekey',
					customFormatter: function(record, levelName) {
						return {description: util.format('[%s] %s', levelName.toUpperCase(), record.error)};
					}
				}),
				level: 'info'
			});

			var expectedResponse = {
					body: JSON.stringify({
						description: '[INFO] foobar',
						service_key: 'myservicekey',
						event_type: 'trigger',
					}),
					url: BunyanPagerDuty.PD_POST_URL,
			};

			log.info({error: 'foobar'});
			request.post.calledWith(expectedResponse);
		});

		it('should accept an object and string as arguments', function() {
			var log = Bunyan.createLogger({
				name: 'myapp',
				stream: new BunyanPagerDuty({
					service_key: 'myservicekey',
					customFormatter: function(record, levelName) {
						return {description: util.format('[%s] %s & %s', levelName.toUpperCase(), record.error, record.msg)};
					}
				}),
				level: 'info'
			});

			var expectedResponse = {
					body: JSON.stringify({
						description: '[INFO] this is the error & this is the message',
						service_key: 'myservicekey',
						event_type: 'trigger',
					}),
					url: BunyanPagerDuty.PD_POST_URL,
			};

			log.info({error: 'this is the error'}, 'this is the message');
			request.post.calledWith(expectedResponse);
		});
	});
});
