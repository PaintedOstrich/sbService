/**
 * Module dependencies.
 */

// var mongoose = require('mongoose'),
var fs = require('fs');

// Load all of the models
var loadModels = function(modelPath) {
    fs.readdirSync(modelPath).forEach(function(file) {
    	try
		{
			require(modelPath + file);
		}
  		catch(err)
		{
			console.log("error intializing " + file + " : due to error: " + err)
		}
    });
  };

module.exports = loadModels;