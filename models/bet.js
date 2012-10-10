/*
 *	Bet Database Wrapper
 */

var redis = require('redis');
var redis_port = process.env.REDIS_PORT || 6379;
var redis_uri = process.env.REDIS_URI  || '127.0.0.1';
var redClient = redis.createClient(redis_port, redis_uri);

var cUtil = require('../user_modules/cUtil');
/* Beginning of Redis Wrapper for Bets */

/**** key creation ****/
// gets bet game list key from sport type (string)
var getGameListKey = function(sport)
{
	return 'game|'+ sport+ '|list';
}

// gets bet info key from game id
var getGameInfoKey = function(gameId)
{
	return 'game|' + gameId + '|info';
}

// gets the last updated time for the game
var getLastUpdateKey = function(gameId)
{
	return 'game|' + gameId + '|update';
}

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
	var hkey = getBetKey(betInfo.gameId, betInfo.initFBId, betInfo.callFBId)
	setMultiHashSetItems(hkey, betInfo, function(err)
	{
		if (err) cb(err)
		addBetForUser(hkey, betInfo.initFBId, betInfo.callFBId, function(err)
		{
			if (err) cb(err);
			cb();
		});
	})
}
// gets all bets for each user
var getUserBets = function(uid, cb)
{
	var key = getUserBetKey(uid);
	redClient.smembers(key, function(err, betKeys)
	{
		if (err) cb(err);
		console.log(betKeys)
		getMultiHashSets(betKeys, function(err, betInfoArr)
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

// iterates through a number of object properties and sets them
var setMultiHashSetItems = function(hkey, namesAndValues, cb)
{
	console.log("hkey:" +hkey);
	var finishedCount = 0;
	var totalCount = cUtil.getNumElements(namesAndValues)
	for (var keyName in namesAndValues)
	{
		redClient.hset(hkey, keyName, namesAndValues[keyName], function(err)
		{
			finishedCount++;
			if (err) cb(err);
			if (finishedCount == totalCount)
			{	
				cb()
			}
		});
	}
}

// iterate through a list of hash keys and get all values for each
var getMultiHashSets = function(hkeys, cb)
{
	console.log("hkeys length:" +hkeys.length);
	var finishedCount = 0;
	var totalCount = hkeys.length;
	var allValues = {};
	for (var index in hkeys)
	{
		var betId = hkeys[index];
		redClient.hgetall(betId, function(betId)
		{
			// pass callback using closure to key unique betid in scope per call
			return function(err, values)
			{
				if (err) cb(err);
				finishedCount++;

				allValues[betId] = values;
				if (finishedCount == totalCount)
				{	
					cb(null, allValues)
				}
			};
		}(betId));
	}
}

module.exports = 
{
	makeBet: makeBet,
	getUserBets: getUserBets,

}

// get user 