/**
 * Module dependencies.
 * Make Database connections per environment
 */

module.exports = function(app){

  var mongoose = require('mongoose');

   // development only
  if (environment == 'development') {

    app.mongoose.connect('mongodb://localhost/test');
  }

  // production only
  if (environment == 'production') {

    console.log('need production mongodb uri')
    // app.mongoose.connect('mongodb://flame.mongohq.com:27087/nodemvr');

};
