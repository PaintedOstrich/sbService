
/*
 * Sport Bet API Info routing
 */
 var url = require('url');
 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')
 var errorHandler = require('../user_modules/errorHandler');

 var pickmonapi = require('../controllers/pickmonapi')
 var userController = require('../controllers/user')
 var userModel = require('../models/user');

var update = function(app) {    
    // return all games for all sports
    // param getTeamNames=1 -> return teamId-> teamName mapping
    app.get('/api/testupdate', function(req, res) {
    	var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
	
		var getTeamNames = query.getTeamNames == 1 ? true : false;

		pickmonapi.updateAllGames("NFL", res);
    });

    // return all games for all sports
    // param getTeamNames=1 -> return teamId-> teamName mapping
    app.get('/api/user/giveusermoney/:userid/:amount', function(req, res) {
    	userModel.updateUserBalance(req.params.userid, req.params.amount, function(err, result)
    	{
    		err && res.send(err);
    		res.send(result);
    	})
    });

   app.get('/api/inituser', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        userController.initUser(query.fbid, query.name, query.money, function(err, data)
        {
            if (err)
            {
                errorHandler.send(res, err)  
            } 
            else
            {
                res.send(data); 
            }
            
        });
    });
}


module.exports = update;
