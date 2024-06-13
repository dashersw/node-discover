var Redis = require('ioredis');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var URL = require('url').URL;

function Socket(opts) {
    EventEmitter.call(this);

    this.opts = opts || {};

    if (this.opts.url) {
        var url = new URL(this.opts.url);
        this.opts.host = url.hostname;
        this.opts.port = url.port;
    }

    this.opts.return_buffers = true;
}
util.inherits(Socket, EventEmitter);

Socket.prototype.bind = function(port, address, callback) {
    this.sub = new Redis(this.opts);
    this.pub = new Redis(this.opts);

    var that = this;

    this.sub.on('message', function(channel, message) {
        if (channel != 'cote') return;

        that.emit('message', message, { address: '0.0.0.0', port: port});
    });

    this.sub.subscribe('cote');

    this.pub.on('ready', () => {
        callback();
        this.emit('listening');
    });

    this.pub.on('error', err => {
        throw err;
    })
    this.sub.on('error', err => {
        throw err;
    })
};

Socket.prototype.setBroadcast = function() {};

Socket.prototype.addMembership = function() {};

Socket.prototype.setMulticastTTL = function() {};

Socket.prototype.close = function() {
    this.sub.unsubscribe();
    this.sub.quit();
    this.pub.quit();
};

Socket.prototype.send = function(msg, offset, length, port, address) {
    this.pub.publish('cote', msg.toString());
}

function createSocket(opts) {
    return new Socket(opts);
}

module.exports = {
    createSocket: createSocket
}
