
var express = require('express')
var bodyLimiter = require('../middleware/bodyLimiter')

// Set Headers For Cross Domain Browser Requests
var setCrossBrowserHeaders = function(req,res,next) {	
	res.header('Access-Control-Allow-Origin','*'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Origin, Accept');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Credentials', 'true');

	if (res.method.toLowerCase() === 'options') {
		// setting up cro0ss browser access preflight response
		res.send(200);
		return;
	}
	else {
		// continue to process actual request
		next(); 
	}
};

// Set Status 
// *** currently not in use
var setStatus = function(req,res,next) 
{	
	// everything is normal. may add additional logic here later
	res.status('200');
	next();
};

var configureSettings = function(app)
{
	app.set('port', process.env.PORT || 5000);

	app.use(bodyLimiter);

  // cross browser enabling
	app.use(setCrossBrowserHeaders);

	app.use(express.bodyParser());
	app.use(express.cookieParser('bdae@gkdl{dd}]fb132afet;dsfasdfbxcwerd'));
	app.use(express.session({secret: process.env.SESSION_SECRET || 'secret123'}));
	app.use(express.methodOverride());

	// FB params 
	//     app_id: process.env.FACEBOOK_APP_ID,
	//     secret: process.env.FACEBOOK_SECRET
	
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