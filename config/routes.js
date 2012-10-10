/**
 * Module dependencies.
 */

var fs = require('fs');

// Load all of the controllers
var loadControllers = function(controllerPath, app) {
	try
	{
		fs.readdirSync(controllerPath).forEach(function(file) {
      		require(controllerPath + file)(app);
    	});
	}
	catch(err)
	{
		console.log("error setting controller:  " + err)
	}
   
  };

module.exports = loadControllers;