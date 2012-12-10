/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var fs = require('fs');

// Load all of the models
var loadModels = function(schemaPath) {
    fs.readdirSync(schemaPath).forEach(function(file) {
    	try
		{
			require(schemaPath + file)(mongoose);
		}
  		catch(err)
		{
			console.log("error intializing " + file + " : due to error: " + err)
		}
    });
  };

module.exports = loadModels;