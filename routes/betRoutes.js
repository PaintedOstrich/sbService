
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
    // Post a user bet
    app.post('/api/bet', function(req, res) {
        var query = req.body;
        
        betController.makeBet(query, function(err, data)
        {
            if(err) {
                errorHandler.send(res, err)
            }
            else {
                data = data || {'succes':true}
                res.send(data)
            }
        });
    });

     // Post a user bet in batch against multiple users
    app.post('/api/bet/batch', function(req, res) {
        var query = req.body;
        
        betController.makeBetBatch(query, function(err, data)
        {
            if(err) {
                errorHandler.send(res, err)
            }
            else {
                data = data || {'succes':true}
                res.send(data)
            }
        });
    });

    // Call a bet (Accept)
    app.post('/api/bet/call/:betid', function(req, res) {
        var query = req.body;
        betController.callBet(req.params.betid, function(err,data)
        {
            if (err) errorHandler.send(res,err)
            else
            {
                data = data || {'succes':true}
                res.send(data)
            }
        });
    });

    // Bet Request (for inviting user not already in the app);
    app.post('/api/bet/request', function(req, res) {
        var query = req.body;
        betController.makeBetRequest(query, function(err,requestString)
        {
            if (err) errorHandler.send(res,err)
            else
            {
                res.send(requestString)
            }
        });
    });

    // set users receiving bet request
    app.post('/api/bet/request/confirm', function(req, res) {
        var query = req.body;
        betController.confirmBetRequest(query, function(err,success)
        {
            if (err) errorHandler.send(res,err)
            else
            {
                res.send(success)
            }
        });
    });

    // Decline User Bet
    // POST: /api/bet/decline/:betid
    // returns (success:true : or err: associate error)
    app.post('/api/bet/decline/:betid', function(req, res) {
        betController.declineBet(req.params.betid, function(err,success)
        {
            if (err) errorHandler.send(res,err)
            else
            {
                success = success || {success:true};
                res.send(success)
            }
        });
    });

    app.get('/api/bet/recent', function(req, res) {
        betStatsController.getRecentBets(5, function(err, data)
        {
            if (err) {
                errorHandler.send(res, err);
            } 
            else {
                res.send(data);
            }
        });
    });
}
 
module.exports = bet;
