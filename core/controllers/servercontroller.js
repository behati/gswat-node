var rcon = require('../RCON/rcon')
var gswatconf = require('../../config/gswat-config')

/* Returns the serverinfo */
exports.serverInfo = function (req, res) {

    rcon.connect(gswatconf.options, function () {
        rcon.send('serverInfo', function (response) {
            res.send(response);
        })
    })
};

/* Attempts to connect to a server and set the provided credentials */
exports.connect = function (req, res) {
    var credentials = req.body;
    console.log(credentials);
    rcon.connect(credentials, function() {
        // Connected
        // @todo overwrite the saved credentials with the new ones
    });

    rcon.on('connect', function() {
        console.log('connected');
        res.send(200,"Succesfully connected - credentials updated");
    })

    rcon.on('error', function(err) {
        console.log(err)
        res.send(500,err)
    });
};

/* Returns the currently stored server credentials */
exports.getServerCreds = function (req, res) {
    res.send({'ServerIP' : gswatconf.options.ServerIP, 'ServerPort': gswatconf.options.ServerPort });
}

/* Returns a list of the current players on the server */
exports.getPlayerList = function (req, res) {
    rcon.connect(gswatconf.options, function () {
        rcon.send('listPlayers', function (response) {
            res.send(response);
        })
    });

    rcon.on('error', function(err) {
        res.send(500,err);
    });
};

/* Lists all the available admin commands on the server (rcon admin.help) */
exports.getAdminHelp = function (req, res) {
    rcon.connect(gswatconf.options, function() {
        rcon.send('admin.help', function(response) {
            res.send(response);
        });
    });
}

/* Lists all the maps in the servers map_cycle */
exports.listMaps = function (req, res) {
    rcon.connect(gswatconf.options, function() {
        rcon.send('mapList.list', function(response) {
            res.send(response);
        });
    });

    rcon.on('error', function(err) {
        res.send(500,err);
    });
}


