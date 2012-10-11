/*
 *	Bet Database Wrapper
 */

var redis = require('redis');
var redis_port = process.env.REDIS_PORT || 6379;
var redis_uri = process.env.REDIS_URI  || '127.0.0.1';
var redClient = redis.createClient(redis_port, redis_uri);

var cUtil = require('../user_modules/cUtil');
var base = require('./base');
/* Beginning of Redis Wrapper for Bets */

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
	var hkey = getBetKey(betInfo.gameId, betInfo.initFBId, betInfo.callFBId)
	base.setMultiHashSetItems(hkey, betInfo, function(err)
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



module.exports = 
{
	makeBet: makeBet,
	getUserBets: getUserBets,

}

// get user 