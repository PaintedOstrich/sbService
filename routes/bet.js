
/*
 * Bet routing
 */
 var url = require('url');
 var util = require('util')

 var betController = require('../controllers/bet')
 var betStatsController = require('../controllers/betStats');

var bet = function(app) {
    // Place a User Bet
    app.get('/api/bet', function(req, res) {
    	var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		
		betController.makeBet(res, query);
    });

    // FIXME need to change from get to post
    // app.post('/api/bet', function(req, res) {
    //     var url_parts = url.parse(req.url, true);
    //     var query = url_parts.query;
        
    //     betController.makeBet(res, query);
    // });

     app.get('/api/bet/user/:uid', function(req, res) {
    	var url_parts = url.parse(req.url, true);
		var query = url_parts.query;

		var uid = req.params.uid;

		betController.getUserBets(res, uid);
    });

     app.get('/api/bet/recent', function(req, res) {
        betStatsController.getRecentBets(res);
    });
}
 
module.exports = bet;
