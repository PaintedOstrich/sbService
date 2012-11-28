
/*
 * Game Info routing
 */
 var url = require('url');
 var util = require('util')
 
 var errorHandler = require('../user_modules/errorHandler')

 var gameController = require('../controllers/gameController')

var notif = function(app) {
    
    // return all games for all sports
    // param getTeamNames=1 -> return teamId-> teamName mapping
    app.post('/api/notifications', function(req, res) {
		console.log(req.body)
    });
	
	// app.get('/api/games', function(req, res) {
	// 	// gets all games

	// 	gameController.getGames(res, )
	// });
	}

module.exports = notif;