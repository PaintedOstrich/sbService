
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

// // set global environment variable
DEVELOPMENT = process.env.NODE_ENV !== "production" ? true : false;
console.log('is development:' +DEVELOPMENT)
// // Configuration
require('./config/serverSettings')(app);

// // Load nconf config settings from files and redis
require('./config/configSettings')(__dirname);

// // Database and Model setup
require('./config/database')(__dirname + '/schema/');
require('./config/mongooseConfig')();

// // Routing setup
require('./config/routes')(__dirname + '/routes/', app);

// // Start cron jobs
require('./config/jobs')();

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.send(500, 'Unknown Error');
});
app.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
