
/*
 * User Controller
 */

 var util = require('util')
 var async = require('async');
 var errorHandler = require('../user_modules/errorHandler')
 var userModel = require('../models/userModel')
 var gameController = require('./gameController')

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

// gets all user info on startup
var getBaseUserInfo = function(uid, cb) {
	var baseInfo = {uid : uid};
	try {
		userModel.userExists(uid, function(err, doesExist) {
			if (doesExist) {
				// get user balance
				userModel.getUserBalance(uid, function(err, balance) {
					baseInfo.balance = balance;

					// get user 
					getUserBets(uid, function(err, bets) {
						baseInfo.bets = bets;
						cb(baseInfo)
					})

				})

			}
			else {
				// new User
				cb(null, {user: 'new user'});
			}
		})
	}
	catch(err) {
		cb(err)
	}
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
						userModel.setUserName(uid, name, function(err){
							var newUserInfo = {
								uid:uid,
								name:name,
								balance: data.balance,
							}
							
							cb(null, newUserInfo)
						})
						
					}
				})

			}
		})
	}
	catch (err) {
		cb(err)
	}
}

var filters = ['current', 'past', 'pendingUserAccept', 'pendingOtherAccept'];
// Retrieve all user bets
// @params: uid, [filter ,] cb
var getUserBets = function(uid, filter, cb) {	
	// return just specific filter result
	try {
		var useOneFilter = true;

		console.log(typeof filter)
		// check if user only wants one type of result
		if (typeof filter === "function") {
			// return all results since no filter requested
			cb = filter;
			useOneFilter = false;
		}
		else if (typeof filter === "undefined") {
			useOneFilter = false;
		}
		else if (filter && filters.indexOf(filter) === -1)
		{		
			// return all results if filter doesn't exist
			useOneFilter = false;
		}

		var result = {};
		userModel.getUserBets(uid, function(err, data) {
			if (useOneFilter) {
				result[filter] = filterResults(filter, uid, data)
			}
			else
			{
				
				for (var i = 0; i<filters.length; i++) {
					result[filters[i]] = filterResults(filters[i], uid, data);
				}
			}

			gameController.getAssocBetInfo(data, function(err, assocGameInfo) {
				result['gameInfo'] = assocGameInfo;
				cb(null, result);	
			})
		})
	}
	catch(err) {
		cb(err)
	}
}

// Filters data into four different types past/current/userAccept/pendingAccept
var filterResults = function(filterType, uid, data) {
	var results = [];   

	for(var index in data) {
		var bet = data[index]

		if (filterType === 'current') { 
			if(bet.ended === 'false' && bet.called === 'true') {
			     results.push(bet)
			}
		}
		else if(filterType === 'past') {
			if(bet.ended === 'true')
			{
		    results.push(bet)
			}   
		}
		else if (filterType === 'pendingUserAccept') {
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
	getUserBets:getUserBets,
	initUser: initUser,
	login:login,
	getBaseUserInfo : getBaseUserInfo,
}