
var express = require('express')
var bodyLimiter = require('../middleware/bodyLimiter')
var util = require('util')

// access control list
var allowedDomains = ['sports-bets.herokuapp.com'];
if (DEVELOPMENT) {
	allowedDomains.push('127.0.0.1');
}

// Set Headers For Cross Domain Browser Requests
var setCrossBrowserHeaders = function(req,res,next) {	
	var requestedBy = req.host;
	var index = allowedDomains.indexOf(requestedBy);

	if (index == -1) {
		// FIXME
		// from a forbidden host
		// console.log('forbidden host access attempt from : '+ requestedBy);
		// FIXME server log access attempt
		// return res.send(403);
	}

	// res.header('Access-Control-Allow-Origin', allowedDomains[index]);
	res.header('Access-Control-Allow-Origin', '*';
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Origin, Accept');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');

	/* Access-Control-Allow-Credentials: Indicates whether or not the response to the request can be exposed when the credentials flag is true.  
	 * When used as part of a response to a preflight request, 
	 * this indicates whether or not the actual request can be made using credentials. 
	 * Note that simple GET requests are not preflighted, and so if a request is made for a resource with credentials, 
	 * if this header is not returned with the resource, the response is ignored by the browser and not returned to web content.
	 */
	// res.header('Access-Control-Allow-Credentials', 'true');

	if (req.method.toLowerCase() === 'options') {
		// setting up cro0ss browser access preflight response
		return res.send(200);
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