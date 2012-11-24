/*
 *	Bet Database Wrapper
 */
var redClient = require('../config/redisConfig')()

var cUtil = require('../user_modules/cUtil');
var base = require('./base');
var games = require('./game');
var keys = require('./keys');
var user = require('./user');
var betStats = require('./betStats');
var errorHandler = require('../user_modules/errorHandler');
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

/* Main db functions */
// takes in a betInfo object (validated in api) and stores it
// also adds key to each of users sets of games bet on 
// each bet unique since bet key includes timestamp
var makeBet = function(betInfo, cb)
{
	betInfo.called = false;
	betInfo.ended = false;
	betInfo.timeKey = new Date().getTime();
	var hkey = getBetKey(betInfo.gameId, betInfo.initFBId, betInfo.callFBId, betInfo.timeKey);

	try	
	{
		//make sure bet amount is greater than 0 otherwise return
		if (betInfo.betAmount <= 0)
		{
			cb(errorHandler.errorCodes.betZeroOrNegative);
		}
		else
		{
			games.getGameInfo(betInfo.gameId, function(err, gameInfo)
			{
				// error handling if game doesn't exist
				if(err) throw err;
				
				if (gameInfo == null)
				{
					cb(errorHandler.errorCodes.gameDoesNotExist);
				} 
				// make sure odss are the same
				else if (!checkBetInfo(betInfo, gameInfo))
				{
					err = 
					{
						reason: 'outofdate',
						data : gameInfo
					}

					cb(err);
				}
				else
				{
					user.getUserBalance(betInfo.initFBId, function(err, userMoney)
					{
						var userMoney = parseFloat(userMoney);
						if(err) throw err;
						else if (userMoney >= parseFloat(betInfo.betAmount))
						{
							// user has enough money to make bet
							base.setMultiHashSetItems(hkey, betInfo, function(err)
							{
								if (err) throw err;

								// add to user list of bets
								addBetForUsers(hkey, betInfo.initFBId, betInfo.callFBId, function(err)
								{
									if (err) throw err;

									user.updateUserBalance(betInfo.initFBId, -parseFloat(betInfo.betAmount), function(err, updatedMoney)
									{
										if(err) throw err;
										else
										{
											betStats.setRecentBet(betInfo.gameId, betInfo.initFBId, betInfo.callFBId, betInfo.betAmount, cb)	
										}
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
				}
			})
		}
	}
	catch(err)
	{
		cb(err);
	}
}

// refactor to get all bet info and then process
var callBet = function(gameId, initFBId, callFBId, timeKey, cb)
{
	// recreate bet key
	var betKey = getBetKey(gameId, initFBId, callFBId, timeKey);

	try
	{
		// also checks if bet exists or this field will not be present
		redClient.hget(betKey, 'called', function(err, value)
		{
			if (err) throw err;

			if(value && value === "false")
			{
				// check that time is valid
				redClient.hget(betKey, 'called', function(err, value)
				{

					// get bet amount
					redClient.hget(betKey, 'betAmount', function(err, betAmount)
					{
						if (err) throw err;

						// get user balance and check that it's more than bet amount, otherwise need to watch add
						user.getUserBalance(callFBId, function(err, userMoney)
						{
							if (err) throw err;

							if (parseFloat(userMoney) >= parseFloat(betAmount))
							{
								// set bet called = true
								redClient.hset(betKey, 'called', 'true', function(err)
								{
									if (err) throw err;

									// update new user balance
									user.updateUserBalance(callFBId, -parseFloat(betAmount), function(err, updatedMoney)
									{
										if (err) throw err;

										// add to list of bets per game
										games.addBetForGame(betKey, gameId, function(err)
										{
											if (err) throw err;
											cb();
										})
										
									})
								});
							}
							else
							{
								// user must watch ad then rebet
								cb(ad = {amountNeeded: (betAmount - userMoney)})
							}
						
						})
					})	
				})
			}
			else
			{
				cb({err:"bet already called or doesnt exist"})
			}
		})
	}
	catch(err)
	{
		cb(err)
	}
}

// adds a bet to each user
var addBetForUsers = function(betKey, initFBId, callFBId, cb)
{
	var initKey = keys.getUserBetKey(initFBId);
	var callKey = keys.getUserBetKey(callFBId);

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
	if(betInfo.type === "spread")
	{
		// process bet on spread
		checkParams.push("spreadTeam1", "spreadTeam2")
		
	}
	else if(betInfo.type === "score")
	{
		// process points on game
		checkParams.push("pointsOver", "pointsUnder")
	}
	else if(betInfo.type === "money")
	{
		// process points on money
		checkParams.push("moneyTeam1", "moneyTeam2", "moneyDraw")
	}

	for (var i=0; i < checkParams.length; i++)
	{
		if (betInfo[checkParams[i]] != gameInfo[checkParams[i]])
		{
			return false;
		}
	}

	// check that bet is before wager cutoff
	var d = new Date();
	var wagerCutoff = new Date(betInfo.wagerCutoff);
	if (d > wagerCutoff)
	{
		return false;
	}

	return true;
}

// gets Bet Info necessary for update after game ends
var getBetInfoForProcess = function(gameId)
{
	var betKey = getBetKey(gameId);

}

module.exports = 
{
	makeBet: makeBet,
	callBet: callBet,
}

// get user 