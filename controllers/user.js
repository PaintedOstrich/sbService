
/*
 * User Controller
 */

 var util = require('util')
 
 var errorHandler = require('../user_modules/errorHandler')
 var userModel = require('../models/user')
 var cUtil = require('../user_modules/cUtil');
 var resMes = require('../user_modules/responseMessages');
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
	userModel.getUserBalance(userid, function(err, data)
	{
		err && errorHandler.send(res, err)
		res.send(data);	
	})
}

var initUser = function(uid, name, balance, cb)
{
	try 
	{
		userModel.userExists(uid, function(err, doesExist)
		{
			if (err) cb(err);
			userModel.updateUserBalance(uid, balance, function(err, data)
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

// Retrieve all user bets
var getUserBets = function(uid, filter, cb)
{	
	// make sure uid is all numbers
	if (!cUtil.isOnlyNumber(uid))
	{
		cb(resMes.createErrorMessage(uid + " is not a valid uid"))
	}
	else
	{
		userModel.getUserBets(uid, function(err, data)
		{
			if (err) cb(resMes.createErrorMessage(err))
			else
			{
				if (filter)
				{
					data = filterResults(filter, uid, data)
				}
				
				cb(null,resMes.createDataMessage(data));
			}
		})
	}
}

// Filters data into four different types past/current/userAccept/pendingAccept
var filterResults = function(filterType, uid, data)
{
	var results = [];   

	for(var index in data)
	{
		var bet = data[index]

		if (filterType === "current")    
		{ 
			if(bet.ended == 'false')
			{
			     results.push(bet)
			}
		}
		else if(filterType === "past")
		{
			if(bet.ended == 'true')
			{
		    results.push(bet)
			}   
		}
		else if (filterType === "userAccept")
		{
			if(bet.callFBId == uid && bet.called == 'false')
			{
		    results.push(bet)
			}                         
		}
		else if (filterType === "pendingAccept")
		{
			if(bet.initFBId == uid && bet.called == 'false')
			{
		    results.push(bet)
			}  
		}               
	}

	return results;
}

module.exports = 
{
	getUserBalance:getUserBalance,	
	getUserBets:getUserBets,
	initUser: initUser,
	login:login,
}