/*
 *	Bet Database Wrapper
 */
var redClient = require('../config/redisConfig')()

var cUtil = require('../user_modules/cUtil');
var base = require('./base');
var games = require('./gameModel');
var keys = require('./keys');
var user = require('./userModel');
var datetime = require('../user_modules/datetime');
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

// gets Bet Info necessary for update after game ends
var getBetInfoForProcess = function(gameId)
{
	var betKey = getBetKey(gameId);

}

module.exports = 
{
	getBetKey : getBetKey,
	makeBet: makeBet,
	callBet: callBet,
}

// get user 