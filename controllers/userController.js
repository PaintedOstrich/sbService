
/*
 * User Controller
 */

 var util = require('util')
 var async = require('async');
 var errorHandler = require('../user_modules/errorHandler')
 var gameController = require('./gameController')

 var fbHandle = require('../user_modules/fb/fbHandle')();
 var mixpanel = require('../config/mixPanelConfig');

 var cUtil = require('../user_modules/cUtil');
 var resMes = require('../user_modules/responseMessages');

 var User = require('mongoose').model('User');
 var Bet = require('mongoose').model('Bet');
 var Game = require('mongoose').model('Game');

// gets all user info on startup
var getBaseUserInfo = function(uid, cb) {
	try {
		var fields = {
			balance:1,
			uid:1,
			name:1,
			_id:0
		}

		User.findOne({uid:uid}, fields, function(err, user){
			if(user){
				// get user bets as well
				getUserBets(uid, function(err, bets) {
					// have to create a new user, since mongoose model is read only
					// FIXME
					var returnUser = {
						name    : user.name,
						balance : user.balance,
						uid     : user.uid,
						bets 	  : bets
					}
					cb(null, returnUser)
				})
			}
			else {
				// new User
				console.log('initializing user');
				initUser(uid, cb);
			}
		})
	}
	catch(err) {
		cb(err)
	}
}

var initUser = function(uid, cb) {
	try {
		User.findOne({uid:uid}, function(err, user){
			if (user){
				// don't initialize if already exists
				console.log('user already exists')
				return cb(errorHandler.errorCodes.userAlreadyExists)
			}

			fbHandle.getBaseUserInfo(uid, function(err, userData) {
				// could we get user info?				
				if (err || !userData) {
					cb(errorHandler.errorCodes.graphAccessError)
					console.log('error accessing graph for user ' + uid + '\n ERROR: ' +err)
				}
				else {
					// save user
					var newUser = new User({
						uid       : userData.id,
						firstname : userData.first_name,
						lastname  : userData.last_name,
						name      : userData.name,
						username  : userData.username,
						gender	  :  userData.gender
					})

					newUser.save()
						
					// send user to mixpanel also
					var newUserInfo = {
						'$first_name':userData.first_name,
						'uid':userData.id,
						name: userData.name,
						'$last_name': userData.last_name,
						balance: 0,
						'$created': new Date(),
						'$email': userData.email,
						locale: userData.locale
					}

					// mix Panel Logging
					mixpanel.people.set(uid, newUserInfo);
							
					var returnInfo = {
						name : newUser.name,
						balance : newUser.balance,
						uid     : newUser.uid,
					}		

					// populate fake bets object to keep front end response consistent
					getUserBets(uid, function(err, bets) {
						returnInfo.bets = bets;
						cb(null, returnInfo)
					})
				}
			})
		})
	}
	catch(e) {
		cb(e)
	}
}

var isUserInApp= function (uid){
	return true;
}
// increments user balance by new amount (an decremetn also)
var updateUserBalance = function(uid, amountToIncrement, cb) {
	User.update({uid:uid}, {$inc: {balance:amountToIncrement}}, cb);
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
	getBaseUserInfo : getBaseUserInfo,
	updateUserBalance : updateUserBalance,
	getUserBalance : getUserBalance,
	isUserInApp : isUserInApp,
}