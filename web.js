
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

// // Database and Model setup
require('./config/database')(__dirname + '/models/');

// // Configuration
require('./config/settings')(app);

// // Routing setup
require('./config/routes')(__dirname + '/controllers/', app);

app.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
