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
var updateUserMoney = function(userId, updateAmount, cb)
{
	getUserMoney(userId, function(err, value)
	{
		err && cb(err);
		debugger;
		if (typeof parseInt(updateAmount)=== "NaN")
		{
			cb({error:"passed NaN value to update user money ::" + value})
		}
		else if (value !== "NaN" && typeof parseInt(value) !== "NaN")
		{
			var newAmount = parseInt(updateAmount)+parseInt(value);
		}
		else 
		{
			var newAmount = parseInt(updateAmount);
		}
		
		var update = {money: newAmount};
		base.setMultiHashSetItems(getUserKey(userId), update, function(err)
		{
			if (err) cb (err);

			cb(null, success = {"money" : newAmount});
		})
	})
}

var getUserMoney = function(userId, cb)
{
	redClient.hget(getUserKey(userId), 'money', function(err, value)
	{
		err && cb(err);

		cb(null, value)
	})
}

/* batched request of user names */
var getUserNames = function(userIds, cb)
{
	fields = ["fullname"];
	base.getMultiHashSetsAsObjectForFields(userIds, getUserKey, fields, function(err, values)
	{
		err && cb(err);
		cb(values);
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
	getUserMoney : getUserMoney,
	updateUserMoney : updateUserMoney
}