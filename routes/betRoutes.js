
/*
 * Bet routing
 */
 var url = require('url');
 var util = require('util')

 var betController = require('../controllers/betController')
 var betStatsController = require('../controllers/betStatsController');
 var errorHandler = require('../user_modules/errorHandler')
 var resMes = require('../user_modules/responseMessages')

var bet = function(app) {
    // Place a User Bet
    app.get('/api/bet', function(req, res) {
    	var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		
		betController.makeBet(query, function(err, data)
        {
            if(err) {
                res.send(err)
            }
            else {
                res.send(data)
            }
        });
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
                res.send(resMes.createSuccessMessage())
            }
        });
    });
    // FIXME need to change from get to post
    // app.post('/api/bet', function(req, res) {
    //     var url_parts = url.parse(req.url, true);
    //     var query = url_parts.query;
        
    //     betController.makeBet(res, query);
    // });

     app.get('/api/bet/recent', function(req, res) {
        betStatsController.getRecentBets(res);
    });
}
 
module.exports = bet;
