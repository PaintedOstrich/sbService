// START Individual ROUTE Declaration
// This sets up all route locations for each api group

var routes = require('./routes');
var _ = require('underscore');

routes.friends = _.extend(require('./routes/friends'), 
                          require('./routes/friends/new'),
                          require('./routes/friends/show'),
                          require('./routes/friends/edit'),
                          require('./routes/friends/delete'));
                           
routes.user = _.extend(require('./routes/friends'),
                       require('./routes/friends/new'),
                       require('./routes/friends/show'),
                       require('./routes/friends/edit'),
                       require('./routes/friends/delete'));

routes.bet = _.extend(require('./routes/bet/new'),
                      require('./routes/bet/accept'),
                      require('./routes/bet/counter'));

// Bootstrap Route Handling
module.exports = function(app) {
    app.get('/bet/new', routes.bet.new);
    app.get('/bet/accept', routes.bet.index);            
    app.get('/bet/counter', routes.bet.counter);
    
    //app.post('/runs', routes.runs.create);
    //app.get('/runs/:id', routes.runs.show);
    //app.get('/runs/:id/edit', routes.runs.edit);
    //app.put('/runs/:id', routes.runs.update);
    //app.delete('/runs/:id', routes.runs.delete);
}

// END ROUTE Declaration
