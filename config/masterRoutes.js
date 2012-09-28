/**
 * Module dependencies.
 * This sets up routing for each sub api group
 */

var routes = require('../routes');
var _ = require('underscore');

var fs = require('fs');

// synchronous loading of routing
var loadControllers = function(modelPath) {
  debugger;
  var tmpCollection = {};
  modelPath = fs.realpathSync(modelPath);
  fs.readdirSync(modelPath).forEach(function(file) {
    tmpCollection = _.extend(require(modelPath + '/' + file));
  });
  return tmpCollection;
}
/*fs.readdirSync('.').forEach(function(file) {
......... console.log(file)
......... console.log(file.split('.')[0])
......... })*/
routes.user = loadControllers(require('../routes/user/index.js'));
                      

routes.friends = loadControllers('./routes/friends');
                           
routes.bet = loadControllers('./routes/bet');
console.log(routes.bet);

// Bootstrap Route Handling
module.exports = function(app) {
  // Helper function to prefix routes with api.  Separate for clarity 
  // var routeHelper = function(app ,routeSuffix, routeCommand) {
  //   app.get('/api/' + routeSuffix, routeCommand);
  // }

  app.get('/bet/new', routes.bet.new);
  app.get('/user/add', routes.user.index);
  // routeHelper('bet/accept', routes.bet.index);            
  // routeHelper('bet/counter', routes.bet.counter);
  //app.post('/runs', routes.runs.create);
  //app.get('/runs/:id', routes.runs.show);
  //app.get('/runs/:id/edit', routes.runs.edit);
  //app.put('/runs/:id', routes.runs.update);
  //app.delete('/runs/:id', routes.runs.delete);
}

// END ROUTE Declaration
