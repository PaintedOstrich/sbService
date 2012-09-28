var fs = require('fs');

var loadControllers = function(modelPath) {
  var tmpCollection = {};
  fs.readdirSync(modelPath).forEach(function(file) {
    require(modelPath + file);
  });

