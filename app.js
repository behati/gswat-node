/**
 *   Pure Battlefield GSWAT - Node.js port 0,0,1
 */
var express = require('express');
var passport = require('passport');

// Load configurations
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
var auth = require('./config/middlewares/authorization');

var app = express();
// express settings
require('./config/express')(app,config,passport);

// Bootstrap routes
require('./config/routes')(app,passport,auth);

// Start the app by listening on <port>
var port = process.env.PORT || 3000;
app.listen(port);
console.log('GSWAT-node started on ' + port);

