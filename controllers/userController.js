
/*
 * User Controller
 */

 var util = require('util')
 var async = require('async');
 var errorHandler = require('../user_modules/errorHandler')
 var userModel = require('../models/userModel')
 var gameController = require('./gameController')
 var mixpanel = require('../config/mixPanelConfig');

 var cUtil = require('../user_modules/cUtil');
 var resMes = require('../user_modules/responseMessages');
 var verifyFBLogin = require('../user_modules/fb/verifyFBLogin');

 var User = require('mongoose').model('User');
 var Bet = require('mongoose').model('Bet');
 var Game = require('mongoose').model('Game');

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
	try {
		var fields = {
			balance:1,
			fullname:1
		}

		User.findOne({uid:uid}, fields, function(err, user){
			if(user){
				// get user 
				getUserBets(uid, function(err, bets) {
					debugger;
					user.field = 'asdf'
					console.log(util.inspect(user, true, 3))
					var resp = {
						user:user,
						bets :bets
					}
					
					cb(null, resp)
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

// gets user balance
var getUserBalance = function(uid, cb){
	var fields = {
		'balance':1,
		'uid':1,
		'fullname':1
	}

	User.findOne({uid:uid}, fields, cb)
}

var initUser = function(uid, name, email, balance, cb) {
	User.find({uid:uid}, function(err, user){
		if (user.uid){
			cb(errorHandler.errorCodes.userAlreadyExists)
		}
		else {
			// process user name 
				var parts = name.split(' ');
				var firstname = parts[0];
				var lastname = parts.slice(1).join(' ');

			// save user
			var user = new User({
				uid: uid,
				firstname : firstname,
				lastname : lastname,
				fullname : name,
				balance  : balance,
			}).save();
				
			// send user to mixpanel also
			var newUserInfo = {
				'$first_name':firstname,
				'uid':uid,
				'$last_name': lastname,
				balance: balance,
				'$created': new Date(),
				'$email': email,
			}

			// mix Panel Logging
			mixpanel.people.set(uid, newUserInfo);
					
			cb(null, newUserInfo)
		}
	})
}

var isUserInApp= function (uid){
	return true;
}
// increments user balance by new amount (an decremetn also)
var updateUserBalance = function(uid, amountToIncrement, cb) {
	User.update({uid:uid}, {$inc: {balance:amountToIncrement}}, cb);
}

// Retrieve all user bets
var getUserBets = function(uid, cb) {	
	var query = Bet.find();
	query.or([{initFBId:uid}, {callFBId:uid}]).exec(function(err, bets){
		filterResults(uid, bets, cb);
	})
}


// Filters data into four different types past/current/userAccept/pendingAccept
var filterResults = function(uid, bets, cb) {
	var result = {
		'current' : [],
		'past' : [],
		'pendingUserAccept' : [],
		'pendingOtherAccept' : [],
	};
	for (var index in bets) {
		var bet = bets[index];

		if (!bet.called && !bet.processed && bet.callFBId == uid){
			result.pendingUserAccept.push(bet);
		}
		else if(bet.processed && bet.called) {
			result.past.push(bet);
		}
		else if(!bet.processed && bet.called) {
			result.current.push(bet);
		}
		else if(!bet.processed && !bet.called && bet.initFBId == uid) {
			result.pendingOtherAccept.push(bet);
		}
		else {
			console.log('bad bet\n' + bet );
		}
	}
 		
 	cb(null, result)
}

module.exports = {
	getUserBets:getUserBets,
	initUser: initUser,
	login:login,
	getBaseUserInfo : getBaseUserInfo,
	updateUserBalance : updateUserBalance,
	getUserBalance : getUserBalance,
	isUserInApp : isUserInApp,
}