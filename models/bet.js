/*
 *	Bet Database Wrapper
 */
var redClient = require('../config/redisConfig')()

var cUtil = require('../user_modules/cUtil');
var base = require('./base');
var games = require('./game');
var user = require('./user');
/* Beginning of Redis Wrapper for Bets */

/** module variables **/


/**** key creation ****/
// generates a unique key for each bet
// based upon game Id, user ids, and time
var getBetKey = function(gameId, initFBId, callFBId)
{
	var date = new Date()
	var betKey = 'bet|' + gameId + '|' + initFBId + '|' + callFBId + '|' + date.getTime();
	return betKey;
}

// gets bets for a given user
var getUserBetKey = function(gameId, fbid)
{
	return 'bets|user|' + fbid;
}

/* Main db functions */
// takes in a betInfo object (validated in api) and stores it
// also adds key to each of users sets of games bet on 
var makeBet = function(betInfo, cb)
{
	betInfo.called = false;
	betInfo.time = new Date()
	var hkey = getBetKey(betInfo.gameId, betInfo.initFBId, betInfo.callFBId);

	//make sure bet amount is greater than 0 otherwise return
	if (betInfo.betAmount <= 0)
	{
		cb(err = {reason: 'cannot bet zero or less'});
	}

	games.getGameInfo(betInfo.gameId, function(err, values)
	{
		// error handling if game doesn't exist
		err && cb(err);
		
		if (typeof values === "undefined")
		{
			cb(err = {reason:'gamenotexist'});
			return;	
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

		user.getUserMoney(betInfo.initFBId, function(err, value)
		{
			err && cb(err);

			if (value >= betInfo.betAmount)
			{
				// user has enough money to make bet
				base.setMultiHashSetItems(hkey, betInfo, function(err)
				{
					if (err) cb(err)

					// add to user list of bets
					addBetForUser(hkey, betInfo.initFBId, betInfo.callFBId, function(err)
					{
						if (err) cb(err);
						cb();
					});
				})
			}
			else
			{
				// user must watch ad then rebet
				cb(ad = {amountNeeded: (betInfo.betAmount - value)})
			}
		})
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
var addBetForUser = function(betKey, initFBId, callFBId, cb)
{
	var initKey = getUserBetKey(initFBId);
	var callKey = getUserBetKey(callFBId);

	// add both and then call back
	redClient.sadd(initKey, betKey, function(err)
	{
		if (err) cb(err)
		redClient.sadd(callFBId, betKey, function(err)
		{
			if(err) cb(err)
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

	for (param in checkParams)
	{
		if (betInfo[param] != gameInfo[param])
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