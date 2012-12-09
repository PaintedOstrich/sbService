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
	var betKey = 'bet|' + gameId + '|' + initFBId + '|' + callFBId + '|' + timeKey;
	return betKey;
}

// save bet info
var saveBet= function(betKey, betInfo, cb) {
	base.setMultiHashSetItems(betKey, betInfo, cb);
}

// update bet to called
var setCalledForBet = function(betKey, cb) {
	redClient.hset(betKey, 'called', 'true', cb);
}

// update bet to called
var setEndedForBet = function(betKey, cb) {
	redClient.hset(betKey, 'ended', 'true', cb);
}

// gets All info for specific bet
var getBetInfo = function(betKey, cb) {
	var hkeys = [betKey];
	redClient.hgetall(betKey, cb);
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

module.exports = 
{
	getBetKey : getBetKey,
	getBetInfo : getBetInfo,
	saveBet   : saveBet,
	setCalledForBet : setCalledForBet,
	addBetForUsers : addBetForUsers,
	setEndedForBet : setEndedForBet,
}

// get user 