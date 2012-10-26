
/*
 * Bet routing
 */
 var url = require('url');
 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')

 var betController = require('../controllers/bet')

var bet = function(app) {
    // Place a User Bet
    app.get('/api/bet', function(req, res) {
    	var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		
		betController.makeBet(res, query);
    });
    app.post('/api/bet', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        
        betController.makeBet(res, query);
    });

     app.get('/api/bet/user/:uid', function(req, res) {
    	var url_parts = url.parse(req.url, true);
		var query = url_parts.query;

		var uid = req.params.uid;

		betController.getUserBets(res, uid);
    });
}
 
module.exports = bet;
