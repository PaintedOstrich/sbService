/**
 * Module dependencies.
 * Make Database connections per environment
 */

 // Load Mongo Database Schema 
var loadModels = function(modelPath, ) {
  fs.readdirSync(modelPath).forEach(function(file) {
    require(modelPath + file);
  });
};

module.exports = function(app){

  var mongoose = require('mongoose');
  var redis = require('redis'),

  // Load database schema for models
  loadModels('.models/schema')

   // development only
  if (environment == 'development') {

    app.mongoose.connect('mongodb://localhost/sportsService')

  }

  // production only
  if (environment == 'production') {

    console.log('need production mongodb uri')
    throw;
  }
    // app.mongoose.connect('mongodb://flame.mongohq.com:27087/nodemvr');




};


