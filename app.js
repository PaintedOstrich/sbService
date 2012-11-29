
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
require('./config/serverSettings')(app);

// // Routing setup
require('./config/routes')(__dirname + '/routes/', app);

// // Load nconf config settings from files and redis
require('./config/configSettings')(__dirname);

// // Start cron jobs
require('./config/jobs')();

app.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
