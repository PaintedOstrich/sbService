/*
 *	Bet Database Wrapper
 */
var redClient = require('../config/redisConfig')()

var cUtil = require('../user_modules/cUtil');
var base = require('./base');
var games = require('./game');
var user = require('./user');
var betStats = require('./betStats');
var errorHandler = require('../user_modules/errorHandler')
/* Beginning of Redis Wrapper for Bets */

/** module variables **/

/**** key creation ****/
// generates a unique key for each bet
// based upon game Id, user ids, and time
var getBetKey = function(gameId, initFBId, callFBId, timeKey)
{
	var betKey = 'bet|' + gameId + '|' + initFBId + '|' + callFBId + '|' + timeKey;;
	return betKey;
}

// gets bets for a given user
var getUserBetKey = function(fbid)
{
	return 'bets|user|' + fbid;
}

/* Main db functions */
// takes in a betInfo object (validated in api) and stores it
// also adds key to each of users sets of games bet on 
// each bet unique since bet key includes timestamp
var makeBet = function(betInfo, cb)
{
	betInfo.called = false;
	betInfo.timeKey = new Date().getTime();
	var hkey = getBetKey(betInfo.gameId, betInfo.initFBId, betInfo.callFBId, betInfo.timeKey);

	//make sure bet amount is greater than 0 otherwise return
	if (betInfo.betAmount <= 0)
	{
		cb(err = {reason: 'cannot bet zero or less'});
	}

	games.getGameInfo(betInfo.gameId, function(err, values)
	{
		// error handling if game doesn't exist
		err && cb(err);
		
		if (values != null)
		{
			cb(errorHandler.errorCodes.gameDoesNotExist);
		} 

		// make sure odss are the same
		if (!checkBetInfo(betInfo, values))
		{
			err = 
			{
				reason: 'outofdate',
				data : values
			}

			cb(err)
		}

		user.getUserBalance(betInfo.initFBId, function(err, userMoney)
		{
			var userMoney = parseFloat(userMoney);
			err && cb(err);
			if (userMoney >= parseFloat(betInfo.betAmount))
			{
				// user has enough money to make bet
				base.setMultiHashSetItems(hkey, betInfo, function(err)
				{
					if (err) cb(err)

					// add to user list of bets
					addBetForUsers(hkey, betInfo.initFBId, betInfo.callFBId, function(err)
					{
						if (err) cb(err);

						user.updateUserBalance(betInfo.initFBId, -parseFloat(betInfo.betAmount), function(err, updatedMoney)
						{
							err && cb(err)
							betStats.setRecentBet(betInfo.gameId, betInfo.initFBId, betInfo.callFBId, betInfo.betAmount, cb)
						})
					});
				})
			}
			else
			{
				// user must watch ad then rebet
				cb(ad = {amountNeeded: (betInfo.betAmount - userMoney)})
			}
		})
	})
}

var confirmBet = function(gameId, initFBId, callFBId, timeKey, cb)
{
	// recreate bet key
	var betKey = getBetKey(gameId, initFBId, callFBId, timeKey);

	// also checks if bet exists or this field will not be present
	redClient.hget(betKey, 'called', function(err, value)
	{
		err && cb(err)

		if(value && value === "false")
		{
			redClient.hget(betKey, 'amount', function(err, betAmount)
			{
				err && cb(err);

				user.getUserBalance(betInfo.initFBId, function(err, userMoney)
				{
					err && cb(err);

					if (parseFloat(userMoney) >= parseFloat(betAmount))
					{
						redClient.hset(betKey, 'called', 'true', function(err)
						{
							err && cb (err);
							user.updateUserBalance(betInfo.initFBId, -parseFloat(betInfo.betAmount), function(err, updatedMoney)
							{
								err && cb(err)

								cb();
							})
						});
					}
					else
					{
						// user must watch ad then rebet
						cb(ad = {amountNeeded: (betInfo.betAmount - userMoney)})
					}
				
				})
			})	
		}
		else
		{
			cb({err:"bet already called or doesnt exist"})
		}
	})

}

// gets all bets for each user
var getUserBets = function(uid, cb)
{
	var key = getUserBetKey(uid);
	redClient.smembers(key, function(err, betKeys)
	{
		if (err) cb(err);
		base.getMultiHashSets(betKeys, function(err, betInfoArr)
		{
			cb(err, betInfoArr)
		})
	})
}

// adds a bet to each user
var addBetForUsers = function(betKey, initFBId, callFBId, cb)
{
	var initKey = getUserBetKey(initFBId);
	var callKey = getUserBetKey(callFBId);

	// add both and then call back
	redClient.sadd(initKey, betKey, function(err)
	{
		if (err) cb(err);
		redClient.sadd(callKey, betKey, function(err)
		{
			if(err) cb(err);
			cb()
		})
	})
}

// verifies that correct type of bet submitted for user
// not changing of odds
var checkBetInfo = function(betInfo, gameInfo)
{
	checkParams = [];
	if(betInfo.type === "straight")
	{

	}
	else if(betInfo.type === "spread")
	{
		// process bet on spread
		checkParams.push("spreadTeam1", "spreadTeam2", "initTeamBet")
		
	}
	else if(betInfo.type === "score")
	{
		// process points on game
		checkParams.push("pointsOver", "pointsUnder", "initPointsBet")
	}
	else if(betInfo.type === "money")
	{
		// process points on money
		checkParams.push("moneyTeam1", "moneyTeam2", "moneyDrawLine")
	}

	for (var i=0; i < checkParams.length; i++)
	{
		if (betInfo[i] != gameInfo[i])
		{
			return false;
		}
	}

	return true;
}


module.exports = 
{
	makeBet: makeBet,
	getUserBets: getUserBets,

}

// get user 