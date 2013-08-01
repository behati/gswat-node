module.exports = function(app,passport,auth){
	// Controllers
    var server = require('../Core/controllers/servercontroller')

	// API Routes
    // Server
    app.get('/api/server',server.serverInfo);
    app.get('/api/server/connect',server.getServerCreds)
    app.put('/api/server/connect',server.connect)
};