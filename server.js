/**
 *   Pure Battlefield GSWAT - Node.js port 0,0,1
 */
var express = require('express');
var passport = require('passport');
var spawn = require('win-spawn');
var AzureStorage = require('./core/data/AzureStorage');
var env = process.env.NODE_ENV || 'development';
var grunt = null;
var css = null;
if(env == 'release'){
	console.log('Running Grunt in release mode');
	grunt = spawn('grunt',['release']);
} else {
	console.log('Running Grunt in development mode');
	css = spawn('grunt',['css']);
	grunt = spawn('grunt',['template_files']);

	css.stdout.on('data', function(data) {
		// relay grunt output to console
		console.log("%s", data);
	});
}

grunt.stdout.on('data', function(data) {
	// relay grunt output to console
	console.log("%s", data);
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