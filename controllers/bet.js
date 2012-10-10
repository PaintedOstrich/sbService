
/*
 * GET home page.
 */
 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')
 var betModel = require('../models/bet')

	
var makeBet = function(res, query)
{
	var requiredParams = ["gameId", "initFBId", "callFBId", "betAmount", "type"];
	if(query.type === "straight")
	{
		// process straight bet
		requiredParams.push("initTeamBet")
		if(!checkParams(requiredParams, query))
		{
			return;
		}
	}
	else if(query.type === "spread")
	{
		// process bet on spread
		requiredParams.push("spreadTeam1", "spreadTeam2", "initTeamBet")
		if(!checkParams(requiredParams, query))
		{
			return;
		}
	}
	else if(query.type === "score")
	{
		// process points on game
		requiredParams.push("pointsOver", "pointsUnder", "initPointsBet")
		{
			return;
		}
	}
	else if(query.type === "money")
	{
		// process points on money
		requiredParams.push("moneyTeam1", "moneyTeam2", "moneyDrawLine")
		if(!checkParams(requiredParams, query))
		{
			return;
		}
	}
	else
	{
		res.send(resMes.createErrorMessage("need type param"))
		return;
	}

	// enter bet into db
	betModel.makeBet(query, function(err)
	{
		debugger;
		if (err) res.send(resMes.createErrorMessage(err))
		res.send(resMes.createSuccessMessage())	
		return;
	})   	
}
// Function verifies that api has all parameters
var checkParams = function(checkArray, query)
{
	for (i = 0; i< checkArray.length; i++)
	{
		// console.log(checkArray[i] + " : " + query[i])
		if (typeof query[checkArray[i]] === "undefined")
		{
			res.send(resMes.createErrorMessage("missing param: " + checkArray[i]))
			return false;
		}
	}

	return true;
}

// Retrieve all user bets
var getUserBets = function(res, uid)
{
	betModel.getUserBets(uid, function(err, data)
	{
		if (err) res.send(resMes.createErrorMessage(err))
		else
		{
			res.send(data)
		}
	})
}

 
module.exports =
{
	makeBet: makeBet,
	getUserBets: getUserBets,
} 
