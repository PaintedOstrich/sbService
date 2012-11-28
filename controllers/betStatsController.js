
var betStatsModel = require('../models/betStatsModel');
var gameModel = require('../models/gameModel');
var userModel = require('../models/userModel');
var errorHandler = require('../user_modules/errorHandler');
var util = require('util')
// prepares data and finds key to insert at
var setRecentBet = function(gameId, userId1, userId2, amount, cb)
{
	try{
		userModel.getUserNames([userId1, userId2], function(err, data)
		{
			var userName1 = data[userId1].fullname
			var userName2 = data[userId2].fullname

			gameModel.getTeamNamesAndDateForGames([gameId], function(err, data)
			{				
				var team1Name = data[gameId].team1Name;
				var team2Name = data[gameId].team2Name;

				var data = 
				{
					user1Name:userName1 || 'anonymous',
					user2Name:userName2 || 'anonymous',
					team1Name:team1Name || 'anonymous',
					team2Name:team2Name || 'anonymous',
					amount:amount,
				}

				betStatsModel.getRecentBetsInsertKey(function(err, keyNum) {
					betStatsModel.saveRecentBet(keyNum, data, cb)
				})
			})	
		})
	}
	catch(e)
	{
		cb(e)
	}
}

module.exports = 
{
 	setRecentBet: setRecentBet,
}