/*
 *	Bet Database Wrapper
 */

var base = require('./base');
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

			cb(null, success = {"money" : newAmount});
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

module.exports = 
{
	getUserNames : getUserNames,
	getUserBalance : getUserBalance,
	updateUserMoney : updateUserBalance,
}