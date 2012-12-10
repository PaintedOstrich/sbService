
/*
 * Bet Response logic
 */
 var util = require('util')
 var async = require('async')
 var resMes = require('../user_modules/responseMessages')
 var betModel = require('../models/betModel');
 var gameModel = require('../models/gameModel');
 var userModel = require('../models/userModel')
 var betStatsController = require('../controllers/betStatsController');

 var cUtil = require('../user_modules/cUtil');
 var datetime = require('../user_modules/datetime');
 var errorHandler = require('../user_modules/errorHandler');

 var mixpanel = require('../config/mixPanelConfig');
	
var mongoose = require('mongoose');
var Bet = mongoose.model('Bet');
var Game = mongoose.model('Game');
var User = mongoose.model('User');

// upates All bets after game won
var processEndBets = function(gameId, winnerName, isWinnerTeam1,  cb) {
	try {
		// ratio of winnings to amount bet
		var winnerTeamId = gameModel.getUniqueTeamId(winnerName, function(err, winnerTeamId) {
			if (err) {
				console.log('team id must exist on this bet already')
			}
			else {
				var processEndBetFn = endBet(gameId, winnerTeamId, isWinnerTeam1);
				gameModel.getBetsForGame(gameId, function(err, betIds) {
					async.forEach(betIds, processEndBetFn,function(err) {
						if(err) {
							cb(err)
						}
						else {
							gameModel.setProcessGameComplete(gameId, cb);
						}
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
 */
var endBet = function(winnerGameId, winnerTeamId, isWinnerTeam1) {
	return function processEndBet(betKey, cb) {
		betModel.getBetInfo(betKey, function(err, betInfo) {
			// calculate which user one and the winnings ratio from the bet spread
			var winnerFBId = winnerGameId === betInfo.initTeamBet ? betInfo.initFBId : betInfo.callFBId;
			var winSpread = isWinnerTeam1 ? betInfo.spreadTeam1 : betInfo.spreadTeam2;
			var winRatio = calcWinRatio(winSpread);
			// update user winnings with 
			updateWinnings(winnerFBId, betInfo.betAmount, winRatio, function(err) {
				// mark bet as ended
				betModel.setEndedForBet(betKey, cb)
			})
		})
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
		betInfo.ended = false;
		betInfo.timeKey = new Date().getTime();

		try {
			//make sure bet amount is greater than 0 otherwise return
			if (betInfo.betAmount <= 0) {
				cb(errorHandler.errorCodes.betZeroOrNegative);
			}
			else {
				Game.find({uid:betInfo.gameId}, function(err, gameInfo) {
					// error handling if game doesn't exist
					if (!gameInfo.length) {
						cb(errorHandler.errorCodes.gameDoesNotExist);
					} 
					// make sure odss are the same
					else if (!isBetInfoCorrect(gameInfo, betInfo)) {
						var errorInfo = {
							oldOdds: betInfo,
							newOdds: gameInfo
						}

						cb(errorHandler.createErrorMessage(errorHandler.errorCodes.outOfDate, errorInfo))
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
								setBetInfo(betInfo, cb);

								// log bet
								mixpanel.trackMadeBet(betInfo);
							}
						})
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
	var bet = new Bet(betInfo).save(function(err){
		if (err) cb(err);
		else {
			userModel.updateUserBalance(betInfo.initFBId, -parseFloat(betInfo.betAmount), function(err, updatedMoney) {
				// add to list of most recent bets
				betStatsController.setRecentBet(betInfo.gameId, betInfo.initFBId, betInfo.callFBId, betInfo.betAmount, function(err) {
					// add bet to list of bets per this game
					cb(null, {balance:updatedMoney})
				})	
			})
		}
	})
}

// Set Call Info
var setCallInfo = function(betKey, betInfo, cb) {
	// set bet called = true
    betModel.setCalledForBet(betKey, function(err){
		// update new user balance
			userModel.updateUserBalance(betInfo.callFBId, -parseFloat(betInfo.betAmount), function(err, updatedMoney) {           
			    // add to list of bets per game		 
		        cb(null, {balance:updatedMoney})
			});
    });
}

// User Has Sufficient Funds
var doesUserHaveSufficientFunds = function(uid, amountNeeded, cb) {
	User.findOne({uid:uid}, {'balance':1}, function(err, userInfo){
		var currentUserBalalance = parseFloat(userInfo.balance);	
		if (currentUserBalalance >= amountNeeded) {
			cb(null, currentUserBalalance)
		}
		else {
			cb(amountNeeded - currentUserBalalance);
		}
	})
}

// Function verifies that 'bet' request has all parameters
var isMissingParameter = function(query)
{
	// generate list of required parameters
	var requiredParams = ["gameId", "initFBId", "callFBId", "betAmount", "type"];
	if(query.type === "straight")
	{
		// process straight bet
		requiredParams.push("initTeamBet")
	}
	else if(query.type === "spread")
	{
		// process bet on spread
		requiredParams.push("spreadTeam1", "spreadTeam2", "initTeamBet")
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

	// check that bet is before wager cutoff
	var now = new Date();
	var wagerCutoff = new Date(betInfo.wagerCutoff);
	
	return now.isBefore(wagerCutoff);
}

// Calls a user bet
var callBet = function(query, cb) {
	if (typeof query !== 'object') {
		cb(errorHandler.createErrorMessage(errorHandler.errorCodes.missingParameters, 'must post call parameters'));
	}

	var gameId = query.gameId;
	var initFBId = query.initFBId;
	var callFBId = query.callFBId;
	var betTag = query.betTag;

	if (!gameId || !initFBId || !callFBId || !betTag)
	{
		var details = {
			request:'needs all these parameters',
			params : ['gameId', 'initFBId', 'callFBId', 'betTag']
		}
		cb(errorHandler.createErrorMessage(errorHandler.errorCodes.missingParameters, details));
	}
	else
	{
		var betKey = betModel.getBetKey(gameId, initFBId, callFBId, betTag);

		try
		{
			// also checks if bet exists or this field will not be present
			betModel.getBetInfo(betKey, function(err, betInfo) {
				if (!betInfo) {
					cb(errorHandler.errorCodes.betDoesNotExist)
				}
				else if (betInfo.called === 'true') {
					cb(errorHandler.errorCodes.betAlreadyCalled)
				}
				else {
					doesUserHaveSufficientFunds(betInfo.callFBId, parseFloat(betInfo.betAmount), function(amountNeeded, currentUserBalalance) {
						if (amountNeeded)
						{
							// user doesn't have money to make bet
							var data = {
								amountNeeded:amountNeeded
							}

							cb(errorHandler.createErrorMessage(errorHandler.errorCodes.insufficientFunds, data))
						}
						else {
							setCallInfo(betKey, betInfo, cb);

							// log bet
							mixpanel.trackCallBet(betInfo);
						}
					})
				}
			})
		}
		catch(err)
		{
			cb(err)
		}
	}
}
 
module.exports =
{
	makeBet: makeBet,	
	callBet: callBet,
	processEndBets : processEndBets,
} 
