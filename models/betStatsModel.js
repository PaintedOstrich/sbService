/*
 *	Bet Stats Model
 *  This class contains 
 */
var redClient = require('../config/redisConfig')()

var cUtil = require('../user_modules/cUtil');
var base = require('./base');
var gameModel = require('./gameModel');

var recentBetsAllKey = 'recentbets|all';
var totalRecentStored = 20;

/******
*******    THIS IS NOT BEING USED BUT A GOOD EXAMPLE OF HOW TO DO A CACHE IN REDIS FOR A GIVEN ITEM
******/

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

// gets lru key from most recent bets list
var getRecentBetsInsertKey = function(cb)
{
	redClient.hincrby(recentBetsAllKey, 'lru', 1, function(err, num)
	{
		if (parseInt(num) > totalRecentStored)
		{
			redClient.set(recentBetsAllKey, 'lru', 1, function(err)
			{
				cb(err, 1)
			})
		}
		else
		{
			cb(err, parseInt(num))
		}
	})
}

// saves recent bet
var saveRecentBet = function(keyNum, data, cb) {
	base.setMultiHashSetItems(recentBetsAllKey + keyNum, data, cb);
}

module.exports =
{
	getRecentBets: getRecentBets,
	getRecentBetsInsertKey : getRecentBetsInsertKey,
	saveRecentBet : saveRecentBet,
}
