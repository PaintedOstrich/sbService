
/*
 * Game Info routing
 */
 var url = require('url');
 var util = require('util')
 
 var errorHandler = require('../user_modules/errorHandler')

 var gameController = require('../controllers/game')

var game = function(app) {
    
    // return all games for all sports
    // param getTeamNames=1 -> return teamId-> teamName mapping
    app.get('/api/games/:sport', function(req, res) {
		gameController.getGames(req.params.sport, function(err, data)
		{
		  if (err) errorHandler.send(res, err);
	      else
	      {
	        res.send(data);
	      }
		})
    });
	
	// app.get('/api/games', function(req, res) {
	// 	// gets all games

	// 	gameController.getGames(res, )
	// });
	}


module.exports = game;