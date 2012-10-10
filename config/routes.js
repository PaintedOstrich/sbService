/**
 * Module dependencies.
 */

var fs = require('fs');

// Load all of the controllers
var loadControllers = function(controllerPath, app) {
    fs.readdirSync(controllerPath).forEach(function(file) {
      require(controllerPath + file)(app);
    });
  };

module.exports = loadControllers;