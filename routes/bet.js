
/*
 * GET home page.
 */
 var url = require('url');
 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')
 var betModel = require('../models/bet')

 var betController = require('../controllers/bet')

var bet = function(app) {
    // Place a User Bet
    app.get('/api/bet', function(req, res) {
    	var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		
		betController.makeBet(req, res, query);
    });
}
 
module.exports = bet;
