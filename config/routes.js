/**
 * Module dependencies.
 */

var fs = require('fs');

// Load all of the controllers
var loadControllers = function(routePath, app) {

		fs.readdirSync(routePath).forEach(function(file) {
			try
			{
				require(routePath + file)(app);	
			}
      		catch(err)
			{
				console.log("error intializing " + file + " : routes: " + err)
			}
    	});
  };

module.exports = loadControllers;