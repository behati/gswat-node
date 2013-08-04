module.exports = function(app,passport,auth){
	// Controllers
    var server = require('../core/controllers/servercontroller');

	// API Routes
    // Server
    app.get('/api/server',server.serverInfo);
    app.get('/api/server/connect',server.getServerCreds);
    app.put('/api/server/connect',server.connect);    // Http PUT
    app.get('/api/server/players',server.getPlayerList);
    app.get('/api/server/help',server.getAdminHelp);
    app.get('/api/server/maplist',server.listMaps);
    app.get('/api/server/list',server.listServers);
    app.get('/api/server/get',server.getServer);
    app.put('/api/server/setactive',server.setActiveServer);
};