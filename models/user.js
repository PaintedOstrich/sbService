/*
 *	Bet Database Wrapper
 */
var redClient = require('../config/redisConfig')()

var getUserKey = function(userId)
{
	return 'user|' + userId;
}

var updateUserMoney = function(userId, amount, cb)
{
	amount = Math.abs(amount);
	var update = {money: amount};
	base.setMultiHashSetItems(getUserKey(userId), update, function(err)
	{
		if (err) cb (err);

		cb();
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



module.exports = 
{
	getUserMoney : getUserMoney,
	updateUserMoney : updateUserMoney
}