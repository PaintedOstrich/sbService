
/*
 * Sport Bet API Info routing
 */
 var url = require('url');
 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')

 var pickmonapi = require('../controllers/pickmonapi')
 var user = require('../models/user');

var update = function(app) {    
    // return all games for all sports
    // param getTeamNames=1 -> return teamId-> teamName mapping
    app.get('/api/testupdate', function(req, res) {
    	var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
	
		var getTeamNames = query.getTeamNames == 1 ? true : false;

		pickmonapi.updateAllGames("NFL");
    });

    // return all games for all sports
    // param getTeamNames=1 -> return teamId-> teamName mapping
    app.get('/api/user/giveusermoney/:userid/:amount', function(req, res) {
    	user.updateUserMoney(req.params.userid, req.params.amount, function(err, result)
    	{
    		err && res.send(err);
    		res.send(result);
    	})
    });
}


module.exports = update;
