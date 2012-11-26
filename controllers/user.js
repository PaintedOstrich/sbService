
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
var login = function(signedreq, cb) {
	var data = verifyFBLogin.verify(signedreq, process.env.FACEBOOK_SECRET);
	if (data) {
		cb(null, data)
	}
	else {
		cb(errorHandler.errorCodes.invalidSignedRequest);
	}
}
  
var getUserBalance = function(res, userid) {
	userModel.getUserBalance(userid, function(err, data) {
		err && errorHandler.send(res, err)
		res.send(data);	
	})
}

var initUser = function(uid, name, balance, cb) {
	try {
		userModel.userExists(uid, function(err, doesExist) {
			if (err) {
				throw err;
			}
			else if (doesExist){
				cb(errorHandler.errorCodes.userAlreadyExists)
			}
			else {
				userModel.updateUserBalance(uid, balance, function(err, data) {				
					if (balance != data.balance) {
						cb(errorHandler.errorCodes.updateBalanceError);
					}
					else {
						var data = {
							uid:uid,
							name:name,
							balance: data.balance,
						}
						
						cb(null, data)
					}
				})
			}
		})
	}
	catch (err) {
		cb(err)
	}
}

var filters = ['current', 'past', 'userAccept', 'pendingOtherAccept'];
// Retrieve all user bets
// @params: uid, [filter ,] cb
var getUserBets = function(uid, filter, cb) {	
	// return just specific filter result
	var useOneFilter = true;

	if (typeof filter === "function") {
		// return all results since no filter requested
		cb = filter;
		useOneFilter = false;
	}
	else if (filters.indexOf(filter) === -1)
	{	
		// return all results if filter doesn't exist
		useOneFilter = false;
	}

	// make sure uid is all numbers
	if (!cUtil.isOnlyNumber(uid)) {
		cb(resMes.createErrorMessage(uid + ' is not a valid uid'))
	}
	else {
		userModel.getUserBets(uid, function(err, data) {
			if (err) {
				cb(resMes.createErrorMessage(err))
			}
			else {

				if (useOneFilter) {
					var result = filterResults(filter, uid, data)
				}
				else
				{
					var result = {};
					for (var i = 0; i<filters.length; i++) {
						result[filters[i]] == filterResults(filters[i], uid, data);
					}
				}
				
				cb(null, result;
			}
		})
	}
}

// Filters data into four different types past/current/userAccept/pendingAccept
var filterResults = function(filterType, uid, data) {
	var results = [];   

	for(var index in data) {
		var bet = data[index]

		if (filterType === 'current') { 
			if(bet.ended === 'false') {
			     results.push(bet)
			}
		}
		else if(filterType === 'past') {
			if(bet.ended === 'true')
			{
		    results.push(bet)
			}   
		}
		else if (filterType === 'userAccept') {
			if(bet.callFBId === uid && bet.called === 'false') {
		    results.push(bet)
			}                         
		}
		else if (filterType === 'pendingOtherAccept') {
			if(bet.initFBId === uid && bet.called === 'false') {
		    results.push(bet)
			}  
		}               
	}

	return results;
}

module.exports = {
	getUserBalance:getUserBalance,	
	getUserBets:getUserBets,
	initUser: initUser,
	login:login,
}