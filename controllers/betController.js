
/*
 * Bet Response logic
 */
 var util = require('util')
 var async = require('async')
 var resMes = require('../user_modules/responseMessages')
 var betModel = require('../models/betModel');
 var gameModel = require('../models/gameModel');
 var userModel = require('../models/userModel')

 var gameController = require('./gameController');
 var userController = require('./userController');
 var betStatsController = require('./betStatsController')
 var notificationController = require('./notificationController')
 var cUtil = require('../user_modules/cUtil');
 var datetime = require('../user_modules/datetime');
 var errorHandler = require('../user_modules/errorHandler');

 var mixpanel = require('../config/mixPanelConfig');
	
var mongoose = require('mongoose');
var Bet = mongoose.model('Bet');
var Game = mongoose.model('Game');
var User = mongoose.model('User');

// upates All bets after game won
var processEndBets = function(gameHeader, gameDate, winningTeamName, isWinnerTeam1, cb) {
	try {
		// ratio of winnings to amount bet
		var winnerTeamId = gameModel.getUniqueTeamId(winningTeamName, function(err, winnerTeamId) {
			if (err || !winnerTeamId) {
				cb();
				console.log('team id must exist on this bet already')
			}
			else {
				gameController.getGameIdFromInfo(gameHeader, gameDate, function(err, game) {
					if(!game){
						// processing game before server was up and stored game
						console.log('processing ebt we dont have')
						return cb();
					}

					// we have game, so process
					// get team names
					
					var losingTeamName = game.team1Id == winnerTeamId ? game.team1Name : game.team2Name;

					// generate process function
					var processEndBetFn = endBet(winningTeamName, losingTeamName, winnerTeamId, isWinnerTeam1);
					getBetsForGame(game, function(err, bets) {
						// process each bet
						async.forEach(bets, processEndBetFn,function(err) {
							if(err) {
								cb(err)
							}
							else {
								gameController.setProcessGameComplete(gameId, cb);
							}
						})
					})
				})
			}
		}) 
	
	}
	catch(err) {
		cb(err);
	}
}

/* ends individual bet, awarding user winnings and changes 
 * both bet ended to true and each 
 * return function in closure so can be used with async for each
 */
var endBet = function(winningTeamName, losingTeamName, winnerTeamId, isWinnerTeam1) {
	return function processEndBet(bet, cb) {
			if (bet.processed){
				// bet already processed
				// this would be run twice if an error occured somewhere between user processing all bets
				cb()
			}
			else if (!bet.called) {
				// user never called bet so lets give money back
				userController.updateUserBalance(bet.initFBId, bet.betAmount, function(err) {
					bet.update({processed: true}, null, cb)
				})
			}
			else {
				// user won valid bet
				var winSpread = isWinnerTeam1 ? bet.spreadTeam1 : bet.spreadTeam2;
				var winRatio = calcWinRatio(winSpread);
				// update user winnings with 
				var userWinnings = bet.betAmount + parseFloat(bet.betAmount * winRatio);
				userController.updateUserBalance(winnerFBId, userWinnings, function(err) {
					
					// send notifications to users
					notificationController.enqueueBetWon(winnerFBId, loserFBId, bet._id, winningTeamName, bet.betAmount);
					notificationController.enqueueBetLost(loserFBId, winnerFBId, losingTeamName, bet._id);
					
					// mark bet as ended
					bet.update({processed: true}, null, cb)
				})
			}
		
	}
}

/* Calculate win ratio from odds 
 * if spread is -105, then you bet $105 dollars to win $100
 * if spread is 120, then you bet $100 dollars to win $120
 */
var calcWinRatio = function(winSpread) {
	var odds = parseFloat(winSpread);
	if (odds < 0) {
		return 100.0/Math.abs(odds);
	} else {
		return Math.abs(odds)/100.0;
	}
}

/* Gets all bets per given gid
 *
 */
 var getBetsForGame = function(gameId, cb){
 		Bet.find({gid : gameId}, cb);
 }

// makes a batch bet for multiple users.
// some bets may go through, and others may be returned as error.  For example, a user may have enough funds to bet 1 of 2 users.
var makeBetBatch = function(betInfoMult, cb) {
	// try {
	// 	var callFBIds = bet.callFBIds;
	// 	if (!callFBIds || typeof callFBIds != "object"){
	// 			cb(errorHandler.createErrorMessage(errorHandler.errorCodes.missingParameters, "callFBIds not array"))
	// 	}
	// 	else {
	// 		betInfo = betInfoMult;
	// 		// remove callFBIds,
	// 		delete betInfo.callFBIds;

	// 		for ()
	// 	}
	// }
}

// processes bet params and makes sure all required fields are present, then makes bet
var makeBet = function(betInfo, cb) {
	var missingParams = isMissingParameter(betInfo);
	if (missingParams) {
		cb(missingParams)
	}
	else {
		// bet has all parameters, try and process
		betInfo.called = false;
		betInfo.processed = false;
		betInfo.timeKey = new Date().getTime();

		try {
			//make sure bet amount is greater than 0 otherwise return
			if (betInfo.betAmount <= 0) {
				cb(errorHandler.errorCodes.betZeroOrNegative);
			}
			else {
				Game.findOne({gid:betInfo.gameId}, function(err, gameInfo) {
					// error handling if game doesn't exist
					if (!gameInfo) {
						cb(errorHandler.errorCodes.gameDoesNotExist);
					} 
					// make sure odss are the same
					else if (!isBetInfoCorrect(betInfo, gameInfo)) {
						var errorInfo = {
							oldOdds: betInfo,
							newOdds: gameInfo
						}

						cb(errorHandler.createErrorMessage(errorHandler.errorCodes.outOfDate, errorInfo))
					}
					else if (isPastWagerCutoff(gameInfo.wagerCutoff)) {
						console.log('past wager cutoff');
						cb(errorHandler.createErrorMessage(errorHandler.errorCodes.pastWagerCutoff, errorInfo))
					}
					else if (betInfo.initFBId == betInfo.callFBId){
						console.warn('user tried to bet themself '+ betInfo.initFBId);
						cb(errorHandler.errorCodes.cannotBetYourself);
					}
					else if (betInfo.initTeamBetId != gameInfo.team1Id && betInfo.initTeamBetId != gameInfo.team2Id){
						console.warn('tried to bet on team not in game'+ betInfo.initTeamBetId);
						cb(errorHandler.errorCodes.missingParameters);
					}
					else {
						if (!userController.isUserInApp(betInfo.callFBId)){
							// if user is not in app, don't charge
							cb('user not in app');
						}
						else {
							
							doesUserHaveSufficientFunds(betInfo.initFBId, parseFloat(betInfo.betAmount), function(amountNeeded, currentUserBalalance) {
								if (amountNeeded)
								{
									// user doesn't have money to make bet
									var data = {
										amountNeeded:amountNeeded
									}

									cb(errorHandler.createErrorMessage(errorHandler.errorCodes.insufficientFunds, data))
								}
								else {
									setBetInfo(betInfo, function(err, savedBet){
										// log bet
										mixpanel.trackMadeBet(betInfo);

										// send notification to user in app that they were challenged to a bet
										var teamNameForCaller = (betInfo.initTeamBetId == gameInfo.team1Id) ? gameInfo.team1Name : gameInfo.team2Name;
										notificationController.enqueueBetPrompt(savedBet.callFBId, savedBet.initFBId, savedBet._id, teamNameForCaller, savedBet.betAmount);
									})

									// return no error
									cb(null, 'success');
								}
							})
						}
					}
				})
			}
		}
		catch(err)
		{
			cb(err);
		}
	} 	
}

// Set Bet Info 
var setBetInfo = function(betInfo, cb) {
	var bet = new Bet(betInfo).save(function(err, savedBet) {
		if (err) cb(err);
		else {
			userController.updateUserBalance(betInfo.initFBId, -parseFloat(betInfo.betAmount), function(err, updatedMoney) {
				// add to list of most recent bets
				betStatsController.setRecentBet(betInfo.gameId, betInfo.initFBId, betInfo.callFBId, betInfo.betAmount, function(err) {
					// add bet to list of bets per this game
					cb(null, savedBet)
				})	
			})
		}
	})
}

// Calls a user bet
var callBet = function(betid, cb) {
	if (!betid) {
		cb(errorHandler.errorCodes.missingParameters);
	}

	Bet.findOne({_id:betid}, function(err, bet) {			
	// also checks if bet exists or this field will not be present
		if (!bet) {
			cb(errorHandler.errorCodes.betDoesNotExist)
		}
		else if (bet.called) {
			cb(errorHandler.errorCodes.betAlreadyCalled)
		}
		else {
			doesUserHaveSufficientFunds(bet.callFBId, parseFloat(bet.betAmount), function(amountNeeded, currentUserBalalance) {
				if (amountNeeded)
				{
					// user doesn't have money to make bet
					var data = {
						amountNeeded:amountNeeded
					}

					cb(errorHandler.createErrorMessage(errorHandler.errorCodes.insufficientFunds, data))
				}
				else {
					setCallInfo(bet, cb);

					// log bet
					mixpanel.trackCallBet(bet);

					// send notification
					notificationController.enqueueBetAccepted(bet.initFBId, bet.callFBId, bet._id);
				}
			})
		}
	})	
}

// Set Call Info
var setCallInfo = function(bet, cb) {
	// set bet called = true
  bet.update({called:true}, function(err){
  		// update new user balance
		userController.updateUserBalance(bet.callFBId, -parseFloat(bet.betAmount), function(err, updatedMoney) {           
		    // add to list of bets per game		 
	        cb(null, {balance:updatedMoney})
		});
  })
}

// User Has Sufficient Funds
var doesUserHaveSufficientFunds = function(uid, amountNeeded, cb) {
	User.findOne({uid:uid}, {'balance':1}, function(err, userInfo){
		if (!userInfo){
			// init bet user doesn't exist
			return cb(errorHandler.errorCodes.userDoesNotExist)
		}

		var currentUserBalalance = parseFloat(userInfo.balance);	
		if (currentUserBalalance >= amountNeeded) {
			cb(null, currentUserBalalance)
		}
		else {
			cb(amountNeeded - currentUserBalalance);
		}
	})
}

var isPastWagerCutoff = function(wagerCutoff) {
	// check that bet is before wager cutoff
	var now = new Date();
	var wagerCutoff = new Date(wagerCutoff);
	return wagerCutoff.isBefore(now);
}

// Function verifies that 'bet' request has all parameters
var isMissingParameter = function(query)
{
	// generate list of required parameters
	var requiredParams = ["gameId", "initFBId", "callFBId", "betAmount", "type"];
	if(query.type === "straight")
	{
		// process straight bet
		requiredParams.push("initTeamBetId")
	}
	else if(query.type === "spread")
	{
		// process bet on spread
		requiredParams.push("spreadTeam1", "spreadTeam2", "initTeamBetId")
	}
	else if(query.type === "score")
	{
		// process points on game
		requiredParams.push("pointsOver", "pointsUnder", "initPointsBet")
	}
	else if(query.type === "money")
	{
		// process points on money
		requiredParams.push("moneyTeam1", "moneyTeam2", "moneyDrawLine")
	}
	else
	{
		return errorHandler.createErrorMessage(errorHandler.errorCodes.missingParameters, "type")
	}

	var isMissingParameter = false;
	var missingParams = [];
	for (i = 0; i< requiredParams.length; i++)
	{
		// console.log(checkArray[i] + " : " + query[i])
		if (typeof query[requiredParams[i]] === "undefined")
		{
			missingParams.push(requiredParams[i]);
			isMissingParameter = true;
		}
	}

	return isMissingParameter ? missingParams : null;
}

// verifies that correct type of bet submitted for user
// not changing of odds
var isBetInfoCorrect = function(betInfo, gameInfo)
{
	checkParams = [];
	if(betInfo.type === "spread")
	{
		// process bet on spread
		checkParams.push("spreadTeam1", "spreadTeam2")		
	}
	else if(betInfo.type === "score")
	{
		// process points on game
		checkParams.push("pointsOver", "pointsUnder")
	}
	else if(betInfo.type === "money")
	{
		// process points on money
		checkParams.push("moneyTeam1", "moneyTeam2", "moneyDraw")
	}

	for (var i=0; i < checkParams.length; i++)
	{
		if (betInfo[checkParams[i]] != gameInfo[checkParams[i]])
		{
			return false;
		}
	}

	return true;
}

 
module.exports =
{
	makeBet: makeBet,	
	callBet: callBet,
	processEndBets : processEndBets,
} 
