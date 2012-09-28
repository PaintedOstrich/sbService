
var async   = require('async');
var util    = require('util');
var http    = require('http');
var express = require('express');

var app = module.exports = express();

var models = {};
// models.examples = require('./models/example')(app.mongoose).model;

// require('./routes')(app, models);
require('./config/appConfig')(app, express);
require('./config/masterRoutes')(app);


app.listen(process.env.PORT || 5000, function(){
	var environment = process.env.environment || 'development';
	console.log("Listening on " + app.get('port') + ' in "' + environment + '" mode');
});
