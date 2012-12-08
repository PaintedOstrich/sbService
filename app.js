
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

// // set global environment variable
DEVELOPMENT = process.env.NODE_ENV === "development" ? true : false;

// // Configuration
require('./config/serverSettings')(app);

// // Routing setup
require('./config/routes')(__dirname + '/routes/', app);

// // Load nconf config settings from files and redis
require('./config/configSettings')(__dirname);

// // Start cron jobs
require('./config/jobs')();

// // Database and Model setup
// require('./config/database')(__dirname + '/models/');

app.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
