/**
 * Module dependencies.
 */

// var mongoose = require('mongoose'),
var fs = require('fs');

// Load all of the models
var loadModels = function(modelPath) {
    fs.readdirSync(modelPath).forEach(function(file) {
      require(modelPath + file);
    });
  };

module.exports = loadModels;