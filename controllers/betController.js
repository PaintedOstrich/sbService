
/*
 * Bet Response logic
 */
 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')
 var betModel = require('../models/betModel');
 var gameModel = require('../models/gameModel');
 var userModel = require('../models/userModel')
 var betStatsController = require('../controllers/betStatsController');

 var cUtil = require('../user_modules/cUtil');
 var datetime = require('../user_modules/datetime');
 var errorHandler = require('../user_modules/errorHandler');
	
// upates Bet after game won
var endBet = function(gameId) {
	// betModel.get
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
		var betKey = betModel.getBetKey(betInfo.gameId, betInfo.initFBId, betInfo.callFBId, betInfo.timeKey);

		try	{
			//make sure bet amount is greater than 0 otherwise return
			if (betInfo.betAmount <= 0) {
				cb(errorHandler.errorCodes.betZeroOrNegative);
			}
			else {
				gameModel.getGameInfo(betInfo.gameId, function(err, gameInfo) {
					// error handling if game doesn't exist
					if (gameInfo == null) {
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
								setBetInfo(betKey, betInfo, cb);
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
var setBetInfo = function(betKey, betInfo, cb) {
	// save bet info with unique hash key
	betModel.saveBet(betKey, betInfo, function(err) {
		// add to user list of bets
		betModel.addBetForUsers(betKey, betInfo.initFBId, betInfo.callFBId, function(err) {
			// update user balance
			userModel.updateUserBalance(betInfo.initFBId, -parseFloat(betInfo.betAmount), function(err, updatedMoney) {
				// add to list of most recent bets
				betStatsController.setRecentBet(betInfo.gameId, betInfo.initFBId, betInfo.callFBId, betInfo.betAmount, function(err) {
					// add bet to list of bets per this game
					gameModel.addBetForGame(betKey, betInfo.gameId, function(err) {
						cb(null, {balance:updatedMoney})
					})
				})	
			})
		})
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
	userModel.getUserBalance(uid, function(err, userMoney) {
		var currentUserBalalance = parseFloat(userMoney);	
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
		return errorHandler.createErrorMessage(errorCodes.missingParameters, "type")
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
var callBet = function(gameId, initFBId, callFBId, betTag, cb)
{
	if (!gameId || !initFBId || !callFBId || !betTag)
	{
		var details = {
			request:'needs all these parameters',
			params : ['gameId', 'initFBId', 'callFBId', 'betTag']
		}
		cb(errorHandler.createErrorMessage(errorHandler.missingParameters, details));
	}
	else
	{
		var betKey = betModel.getBetKey(gameId, initFBId, callFBId, timeKey);

		try
		{
			// also checks if bet exists or this field will not be present
			betModel.getBetInfo(betKey, function(err, betInfo) {
				if (typeof betInfo ===  "undefined") {
					cb(errorHandler.errorCodes.betDoesNotExist)
				}
				else if (betInfo.called === 'true') {
					cb(errorHandler.errorCodes.betAlreadyCalled)
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
							setCallBet(betKey, betInfo, cb);
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
} 
