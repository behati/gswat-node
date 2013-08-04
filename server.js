/**
 *   Pure Battlefield GSWAT - Node.js port 0,0,1
 */
var express = require('express');
var passport = require('passport');
var AzureStorage = require('./core/data/AzureStorage');
var cp = require('child_process');
var env = process.env.NODE_ENV || 'development';
var grunt = null;
if(env == 'release'){
	console.log('Running Grunt in release mode');
	grunt = cp.exec('grunt',['release']);
} else {
	console.log('Running Grunt in development mode');
	grunt = cp.exec('grunt',['default']);
}

grunt.stdout.on('data', function(data) {
	// relay grunt output to console
	console.log("%s", data)
});


// Load configurations
var config = require('./config/config')[env];
var auth = require('./config/middlewares/authorization');

// init Storage
AzureStorage.init();

var app = express();
// express settings
require('./config/express')(app,config,passport);

// Bootstrap routes
require('./config/routes')(app,passport,auth);


// Start the app by listening on <port>
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Server started on ' + port);