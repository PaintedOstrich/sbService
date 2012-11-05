
/*
 * Bet routing
 */
 var url = require('url');
 var util = require('util')

 var betController = require('../controllers/bet')
 var betStatsController = require('../controllers/betStats');
 var errorHandler = require('../user_modules/errorHandler')

var bet = function(app) {
    // Place a User Bet
    app.get('/api/bet', function(req, res) {
    	var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		
		betController.makeBet(res, query);
    });

    // Call a bet (Accept)
    app.get('/api/bet/call', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        
        betController.callBet(query.gameId, query.initFBId, query.callFBId, query.betTag, function(err,data)
        {
            if (err) errorHandler.send(res,err)
            else
            {
                res.send(data)
            }

        });
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
