var net = require('net'),
    util = require('util'),
    EventEmitter = require('eventemitter2').EventEmitter2


var client, rcon, protocol, sequenceId = 0;

var Rcon = EventEmitter;

Rcon.prototype._write = function(command, cb) {
  var packet = protocol.create(command);
  client.write(packet.buffer)
  rcon.once('response.' + packet.id, function(response) {
    cb(protocol.types(response, command.split(' ')[0]))
  })
}

Rcon.prototype.send = function(command, cb) {
  rcon._write(command, function(response) {
    if (response.status !== 'OK') {
      return rcon.emit('_error', response.status)
    }

    if (cb) cb(response)
  })
}

Rcon.prototype.connect = function(opts, cb) {
  protocol = require('./games/' + opts.game)
  client = net.connect(opts.port, opts.host)
  
  client.on('connect', connect);

  protocol.parse(client, function(response) {
    if (response.event) {
      rcon.emit('event', response)
    } else {
      rcon.emit('response.' + response.id, response)
    }
  })

  client.on('close', function() {
    rcon.emit('end')
    if (opts.reconnect) {
      reconnect()
    }
  });

  client.on('error', function(err) {
    console.log(err)
  })

  rcon.on('event', function(response) {
    rcon.emit(response.words[0], {command: response.words[0], response: protocol.types(response)})
  })

  rcon.on('_error', function(err) {
    rcon.emit('error', err)
  })

  function reconnect() {
    setTimeout(function() {
      client.connect(opts.port, opts.host)
    }, 4*1000)
  }

  function connect() {
    if (opts.password) {
      protocol.auth(rcon, opts.password)
    }

    rcon.once('authed', function(response) {
      if (opts.password && opts.watchEvents) {
        rcon.send('admin.eventsEnabled true')
      }
      rcon.emit('connect')
      cb()
    })
  }

}

Rcon.prototype.end = function() {
  client.end()
}


rcon = module.exports = new Rcon({wildcard: true})
