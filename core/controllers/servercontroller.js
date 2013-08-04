var rcon = require('../RCON/rcon');
var AzureStorage = require('../data/AzureStorage');

// Main Page
exports.index = function(req,res){
	res.render('layouts/default');
};

/* Returns the serverinfo */
exports.serverInfo = function (req, res) {
    rcon.send('serverInfo', function (response) {
        res.send(response);
    });

    rcon.on('error', function (err) {
        res.send(500, err);
    })
}

/* Attempts to connect to a server and set the provided credentials */
exports.connect = function (req, res) {
    var credentials = req.body;
    console.log('-- New connection --');
    console.log(credentials);
    rcon.connect(credentials, function () {
        // Connected to RCON
        rcon.send('vars.serverName',function(response) {
            try {
                AzureStorage.addServer(credentials.ServerIP,
                    credentials.ServerPort,
                    credentials.Password,
                    response.name,
                    function (msg) {
                        res.send(200, msg);
                    });
            }
            catch (error) {
                res.send(500, 'There was an error adding the server - ' + error);
            }
        })


    });

    rcon.on('connect', function () {
        console.log('connected');
    })

    rcon.on('error', function (err) {
        console.log("Connection error: " + err)
        res.send(500, err)
    });


};

/* Returns the currently stored server credentials */
exports.getServerCreds = function (req, res) {
    res.send({'ServerIP': rcon.currServer.ServerIP,
              'ServerPort': rcon.currServer.ServerPort });
}

/* Returns a list of the current players on the server */
exports.getPlayerList = function (req, res) {
    rcon.send('listPlayers', function (response) {
        res.send(response);
    })

    rcon.on('error', function (err) {
        res.send(500, err);
    });
};

/* Lists all the available admin commands on the server (rcon admin.help) */
exports.getAdminHelp = function (req, res) {
    rcon.send('admin.help', function (response) {
        res.send(response);
    });
}

/* Lists all the maps in the servers map_cycle */
exports.listMaps = function (req, res) {
    rcon.send('mapList.list', function (response) {
        res.send(response);
    });

    rcon.on('error', function (err) {
        res.send(500, err);
    });
}

/* Returns a list of all servers stored in the datalayer, a server is
  defined by an IP and a Port.
 */
exports.listServers = function (req, res) {
    try {
        AzureStorage.listServers(function(result) {

            if(result.length > 0) {

              var serverlist = [];

              for (var index in result) {
                serverlist.push({
                    ServerIP:result[index].PartitionKey,
                    ServerPort: result[index].RowKey,
                    name: result[index].name
                })
              }

                res.send(200, serverlist);
            }
            else {
                res.send(204, 'No Servers found');
            }

        });
    }
    catch (error) {
        res.send(500, 'There was an error fetching the servers: ' + error);
    }
}

/* Returns all information stored about a server (including password) - needs to be secured
 if used at all.
 */
exports.getServer = function (req, res) {
    if (req.body) {

        try {
            AzureStorage.getServer(req.body.ServerIP, req.body.ServerPort,
                function (result) {
                    if (result == null) {
                        res.send(204, 'The requested server was not found');
                    } else {
                        res.send(200, result);
                    }
                });
        }
        catch (error) {
            res.send(500, "Could not get the server - " + error);
        }
    }
}

/* Sets the currently active rcon-server, if the server is found
   in datalayer. Uses table-stored password so requires auth.
   @todo implement auth (this is a breach atm)
   @requestparams ServerIP, ServerPort
 */
exports.setActiveServer = function (req, res) {
    if (req.body) {
        try {
            AzureStorage.getServer(req.body.ServerIP, req.body.ServerPort,
                function (result) {
                    if (result != null) {
                        rcon.connect(
                           {game: 'bf3',
                            ServerIP: result.PartitionKey,
                            ServerPort: result.RowKey,
                            Password: result.password,
                            watchEvents: false,    // enable events for chat, kills etc.
                            reconnect: false
                        }, function () {

                            // Connected to RCON
                            res.send(200, 'Switched server successfully');
                        });

                    }
                    else {
                        res.send(204, 'The request server was not found');
                    }
                });
        }
        catch (error) {
            res.send(500, "Could not get the server - " + error);
        }

    }
}
