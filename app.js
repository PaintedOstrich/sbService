
var async   = require('async');
var util    = require('util');
var http    = require('http');
var express = require('express');

var app = module.exports = express();
app.environment = process.env.environment || 'development';
var models = {};
// models.examples = require('./models/example')(app.mongoose).model;

// require('./routes')(app, models);
require('./config/appConfig')(app, express);
require('./config/masterRoutes')(app);

// start database models (mongodb and redis)
// require(.)

// Start node Cron 
require('./config/cronSetup')(app);

app.listen(process.env.PORT || 5000, function(){
	console.log("Listening on " + app.get('port') + ' in "' + app.environment + '" mode');
});
