/**
 * Module dependencies.
 */

var fs = require('fs');

// Load all of the controllers
var loadControllers = function(routePath, app) {
	try
	{
		fs.readdirSync(routePath).forEach(function(file) {
      		require(routePath + file)(app);
    	});
	}
	catch(err)
	{
		console.log("error setting controller:  " + err)
	}
   
  };

module.exports = loadControllers;