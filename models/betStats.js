/*
 *	Bet Stats Model
 *  This class contains 
 */
var redClient = require('../config/redisConfig')()

var cUtil = require('../user_modules/cUtil');
var user = require('./user');
var base = require('./base');
var gameModel = require('./game');

var recentBetsAllKey = 'recentbets|all';
var totalRecentStored = 20;

// prepares data and finds key to insert at
var setRecentBet = function(gameId, userId1, userId2, amount, cb)
{
	user.getUserNames([userId1, userId2], function(err, data)
	{
		if (err) throw err;
		else
		{
			var userName1 = data[userId1].fullname
			var userName2 = data[userId1].fullname

			gameModel.getTeamNamesFromGame(gameId, function(err, data)
			{
				if(err) throw err;
				
				var team1Name = data[0].team1;
				var team2Name = data[0].team2;

				var data = 
				{
					userName1:userName1,
					userName2:userName2,
					team1Name:team1Name || 'anonymous',
					team2Name:team2Name || 'anonymous',
					amount:amount,
				}

				redClient.hincrby(recentBetsAllKey, 'lru', 1, function(err, num)
				{
					if (parseInt(num) > totalRecentStored)
					{
						redClient.set(recentBetsAllKey, 'lru', 1, function(err)
						{
							base.setMultiHashSetItems(recentBetsAllKey+'1', data, cb)
						});
					}
					else
					{
						base.setMultiHashSetItems(recentBetsAllKey+num, data, cb)
					}
				})
			})
		}
	})
}

// gets most recent sports bets
// will return null entries if less than 20 total bets have been made
var getRecentBets = function(cb)
{
	var hkeys = [];
	for (i = 1; i <=totalRecentStored; i++)
	{
		hkeys.push(recentBetsAllKey+i);
	}	

	base.getMultiHashSets(hkeys,cb);
}

module.exports =
{
	setRecentBet: setRecentBet,
	getRecentBets: getRecentBets,
}
