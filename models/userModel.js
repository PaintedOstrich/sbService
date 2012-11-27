/*
 *	Bet Database Wrapper
 */

var base = require('./base');
var keys = require('./keys');
var redClient = require('../config/redisConfig')()

var getUserKey = function(userId)
{
	return 'user|' + userId;
}

// updates user money to previous amount + - updateAmount
var updateUserBalance = function(userId, updateAmount, cb)
{
	getUserBalance(userId, function(err, value)
	{
		err && cb(err);
		if (typeof parseFloat(updateAmount)=== "NaN")
		{
			cb({error:"passed NaN value to update user money ::" + value})
		}
		else if (value != null && value != "NaN")
		{
			var newAmount = parseFloat(updateAmount)+parseFloat(value);
		}
		else 
		{
			var newAmount = parseFloat(updateAmount);
		}
		
		var update = {'balance': newAmount};
		base.setMultiHashSetItems(getUserKey(userId), update, function(err)
		{
			if (err) cb (err);

			cb(null, {'balance' : newAmount});
		})
	})
}

var getUserBalance = function(userId, cb)
{
	redClient.hget(getUserKey(userId), 'balance', function(err, value)
	{
		err && cb(err);

		cb(null, value)
	})
}

/* batched request of user names */
var getUserNames = function(userIds, cb)
{
	fields = ["fullname"];
	base.getMultiHashSetsAsObject(userIds, getUserKey, fields, function(err, values)
	{
		err && cb(err);
		cb(null, values);
	})
}

var getUserName = function(userId, cb)
{
	redClient.hget(getUserKey(userId), 'fullname', function(err, value)
	{
		err && cb(err);
		cb(null, value)
	})
}

// gets all bets for each user
var getUserBets = function(uid, cb)
{
	var key = keys.getUserBetKey(uid);
	redClient.smembers(key, function(err, betKeys)
	{
		if (err) cb(err)
		else
		{
			base.getMultiHashSets(betKeys, function(err, betInfoArr)
			{
				cb(err, betInfoArr)
			})
		}
	})
}

var userExists = function(userId, cb)
{
	redClient.hlen(getUserKey(userId), function(err, numFields)
	{
		err && cb(err)
		cb(null, numFields > 0)
	})
}

module.exports = 
{
	getUserNames : getUserNames,
	getUserBalance : getUserBalance,
	updateUserBalance : updateUserBalance,
	userExists : userExists,
	getUserBets: getUserBets,
}