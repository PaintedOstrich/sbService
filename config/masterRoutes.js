/**
 * Module dependencies.
 * This sets up routing for each sub api group
 * NAMING CONVENTIONS:
 *     It is imperative that each file (for example, add.js) that is a route export the request handler function
       containing its own name.  This is assigned here by the routes.

       API's not specified in bootstrap routing will throw exceptions
 *
 */

// var routes = require('../routes');

// Only necessary for special route boostrapping
var _ = require('underscore')

var fs = require('fs');
// load our index of method

var customUtil = require('../customUtil');

// Loading of all routes following above STRICT NAMING Conventions
var loadAllControllers = function(app, controlDir, routeExceptions) {
  var tmpCollection = {};
  // Resolve path passed in
  fs.realpath(controlDir, function(err, resolvedPath){
    // iterate through list of controller/route directories
    fs.readdirSync(resolvedPath).forEach(function(controllerName) {
      // add each path 
      var subDirName = resolvedPath + '/' + controllerName;
      fs.readdirSync(subDirName).forEach(function(file) {
        try{
          var apiName = file.split('.')[0];
          var controlPath = require(subDirName + '/' + apiName);
          app.get('/api/' + controllerName + '/' + apiName, controlPath[apiName])
          // Add error handling here as well
          if (typeof controlPath[apiName] === 'undefined'){
            console.log(controllerName + "/" + apiName + " not defined!");
          }

        }
        catch(err){
          if (routeExceptions.indexOf == -1)
          {
            console.log (controllerName + "/" + apiName + "NOT SPECIFIED!\n"+ err );
          }
          else{
            console.log(err)
          }
        }
      });
    });
  });
}
                          
// Loads all api's not following a specified naming convention and listed here                        
var boostrapRouting = function(app) {

  // Add route exceptions here, so they will not throw an exception
  // Ex: 'friends/add'
  var routeExceptions = [];
  /* @OVERRIDE FOR ROUTES NOT FOLLOWING THE NAMING CONVENTION */

  /* Example: ('./routes/bet/new' refers to the file new.js at this location)
  routes.bet = _.extend(require('./routes/bet/new'),
                      require('./routes/bet/accept'),
                      require('./routes/bet/counter'));

  // Bootstrap Route Handling
  app.get('/bet/new', routes.bet.new);
  app.get('/bet/accept', routes.bet.index);            
  app.get('/bet/counter', routes.bet.counter);
  */
  return routeExceptions;
}

// Bootstrap Route Handling
module.exports = function(app) {
  
  
  // Loads api's not following namin convention
  var routeExceptions = boostrapRouting(app);

  // Load all normal api's
  loadAllControllers(app, './routes', routeExceptions);
}

// END ROUTE Declaration
