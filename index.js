/**
 * syslog.js: Transport for logging to a remote syslog consumer
 */

var dgram = require('dgram'),
	net = require('net'),
	glossy = require('glossy').Produce;

function Logger(options) {
	options = options || {};

	this.host = options.host || 'localhost';
	this.port = options.port || 514;

	this.client = dgram.createSocket('udp4');
	this.client.on('error', function (err) {});

	// Setup our Syslog and network members for later use.
	this.producer = new glossy({
		type: options.type || 'BSD',
		pid: process.pid,
		facility: options.facility || 'local0',
		host: options.localhost || 'localhost';
	}); 
};
		
var levels = [ 'debug', 'info', 'notice', 'warning', 'error', 'crit', 'alert', 'emerg' ];
Logger.prototype.log = function log(level, msg, callback) {
	if (levels.indexOf(level) == -1)  throw new Error('Cannot log unknown syslog level: ' + level);

	var message = new Buffer(this.producer.produce({
		severity: level,
		appName: this.appName,
		date: new Date(),
		message: msg
	}));

	this.client.send(message, 0, message.length, this.port, this.host, function(err, bytes) {
		if (callback) callback(err);
	});
};

module.exports = Logger;
