
/*
 * User Controller
 */

 var util = require('util')
 
 var errorHandler = require('../user_modules/errorHandler')
 var user = require('../models/user')
 var cUtil = require('../user_modules/cUtil');
 var verifyFBLogin = require('../user_modules/fb/verifyFBLogin');

// handles master login method for user and returns all their information
var login = function(signedreq, cb)
{
	var data = verifyFBLogin.verify(signedreq, process.env.FACEBOOK_SECRET);
	if (data)
	{
		cb(null, data)
	}
	else
	{
		cb(errorHandler.errorCodes.invalidSignedRequest);
	}
}
  
var getUserBalance = function(res, userid)
{
	user.getUserBalance(userid, function(err, data)
	{
		err && errorHandler.send(res, err)
		res.send(data);	
	})
}

var initUser = function(uid, name, balance, cb)
{
	try 
	{
		user.userExists(uid, function(err, doesExist)
		{
			if (err) cb(err);
			user.updateUserBalance(uid, balance, function(err, data)
			{				
				if (balance != data.balance)
				{
					cb(errorHandler.errorCodes.updateBalanceError);
				}
				else
				{
					var data = 
					{
						uid:uid,
						name:name,
						balance: data.balance,
					}
					
					cb(null, data)
				}
			})
		})
	}
	catch (err)
	{
		cb(err)
	}
}



module.exports = 
{
	getUserBalance:getUserBalance,	
	initUser: initUser,
	login:login,
}