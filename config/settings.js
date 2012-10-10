
var express = require('express')
var bodyLimiter = require('../middleware/bodyLimiter')

var configureSettings = function(app)
{
	app.set('port', process.env.PORT || 5000);

	app.use(bodyLimiter);
	app.use(express.bodyParser());
	app.use(express.cookieParser('bdae@gkdl{dd}]fb132afet;dsfasdfbxcwerd'));
	app.use(express.session({secret: process.env.SESSION_SECRET || 'secret123'}));
	app.use(express.methodOverride());
    app.use(app.router);

	//env specific config
	// development only
	app.configure('development', function() {
		app.use(express.logger('dev'));
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	// production only
	app.configure('production', function() {
		app.use(express.logger());
		app.use(express.errorHandler());
	})
};

module.exports = configureSettings;