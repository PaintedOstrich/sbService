/*
 * Sport Bet API Info routing
 */
 var url = require('url');
 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')
 var errorHandler = require('../user_modules/errorHandler');

 var pickmonapi = require('../controllers/pickmonapi')
 var userController = require('../controllers/userController')

var update = function(app) {    
    // return all games for all sports
    // param getTeamNames=1 -> return teamId-> teamName mapping
    app.get('/api/test/updateall', function(req, res) {
    	var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
	
		var getTeamNames = query.getTeamNames == 1 ? true : false;

		pickmonapi.updateAllGames(function(err) {
        if (err) {
          res.send(err)
        }
        else {
          res.send('ok')
        }
      });
    });

    app.get('/api/test/getbetgameinfo/:uid', function(req, res){
       var uid = req.params.uid;

      userController.getGameInfoForUserBets(uid, function(err, baseInfo) {
        if (err) {
            errorHandler.send(res, err);
        }
        else {
            res.send(baseInfo)
        }
      })
    })

    app.get('/api/test/getuserinfo/:uid', function(req, res) {
      var uid = req.params.uid;

      userController.getBaseUserInfo(uid, function(err, baseInfo) {
        if (err) {
            errorHandler.send(res, err);
        }
        else {
            res.send(baseInfo)
        }
      })
    });


    // return all games for all sports
    // param getTeamNames=1 -> return teamId-> teamName mapping
    app.get('/api/user/giveusermoney/:userid/:amount', function(req, res) {
    	userModel.updateUserBalance(req.params.userid, req.params.amount, function(err, result)
    	{
    		if (err) {
          res.send(err);
        } 
        else {
          res.send(result);    
        }
    	})
    });

   app.get('/api/inituser', function(req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        userController.initUser(query.fbid, query.name, query.email, query.money, function(err, data)
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
