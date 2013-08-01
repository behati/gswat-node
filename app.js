/**
 *
 */
var rcon = require('./Core/RCON/rcon')

var options = {
    game: 'bf3',
    host: 'host',
    port: 0000,
    password: 'password',
    watchEvents: true,
    reconnect: false
}

rcon.connect(options, function() {
    rcon.send('serverInfo', function(response) {
        console.log(response)
    })
})

rcon.on('connect', function() {
    console.log('connected')
})
