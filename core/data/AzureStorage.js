var azure = require('azure');
var config = require('../../config/config');
var crypto = require('crypto');

// Create the tableService object
var tableService = azure.createTableService(config.azure.account, config.azure.accesskey);

/* Initializes the AzureStorage and creates the required tables if they don't exist */
exports.init = function () {

    try {
        // Create Azure Storage Tables if they don't exist
        tableService.createTableIfNotExists('servers', function (error) {
            if (!error) {
                // Table exists
                console.log('AzureStorage: Table servers initialized');
            }
        });
    }
    catch (err) {
        console.log("AzureStorage error: " + err);
    }
}

/* Creates a new server by adding it to TableStorage */
exports.addServer = function (ip, port, password, name, cb) {

    var server = {
        PartitionKey: ip,
        RowKey: port,
        password: password,
        name: name
    };
    tableService.insertOrReplaceEntity('servers', server, function (error) {
        if (!error) {
            // Entity inserted
            var msg = 'Connected to Server at ' + ip + ":" + port;
            console.log(msg);
            cb(msg);
        }
        else {
            throw new Error("AzureStorage: " + error);
        }
    });
}

/* Returns an object holding the stored data of the requested server */
exports.getServer = function (ip, port, callback) {

    tableService.queryEntity('servers', ip, port.toString(), function (error, serverEntity) {
        if (!error) {
            callback(serverEntity);
        }
        else {
            throw new Error("AzureStorage: " + error);
        }
    });
}

/* Lists all the servers stored in the servers table */
exports.listServers = function (callback) {

    var query = azure.TableQuery
        .select('PartitionKey', 'RowKey', 'name')
        .from('servers');

    tableService.queryEntities(query, function serversFound(err, items) {
        if (!err) {
            callback(items);
        }
        else {
            throw new Error("AzureStorage: " + err)
        }
    });
}

/* Generates a random unique (checks TableStorage) token to identify a new server */
exports.GenerateServerToken = function (cb) {
    crypto.randomBytes(48, function (ex, buf) {
        var token = buf.toString('hex');
    });
}


