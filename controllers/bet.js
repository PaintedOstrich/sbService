
/*
 * GET home page.
 */
 var url = require('url');
 var util = require('util')

var bet = function(app) {
    // Index
    app.get('/api/bet', function(req, res) {
      // Location.find({}, function(err, locations) {
      //   res.json(locations);
      // });
    	var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
	
		var requiredParams = ["gameId", "initFBId", "callFBId", "betAmount", "type"];
		if(query.type === "straight")
		{
			// process straight bet
			requiredParams.push("initTeamBet")
			if(checkParams(requiredParams, query))
			{
				var response = {success: "true"}
				
				res.send(response);
			}
			else
			{
				var response = {error: "bad params"}
				res.send(response)
			}

		}
		else if(query.type === "spread")
		{
			// process bet on spread
			requiredParams.push("spreadTeam1", "spreadTeam2", "initTeamBet")
			if(checkParams(requiredParams, query))
			{
				var response = {success: "true"}
				
				res.send(response);
			}
			else
			{
				var response = {error: "bad params"}
				res.send(response)
			}
		}
		else if(query.type === "score")
		{
			// process points on game
			requiredParams.push("pointsOver", "pointsUnder", "initPointsBet")
			console.log(requiredParams)
			if(checkParams(requiredParams, query))
			{
				var response = {success: "true"}
				
				res.send(response);
			}
			else
			{
				var response = {error: "bad params"}
				res.send(response)
			}
		}
		else if(query.type === "money")
		{
			// process points on money
			requiredParams.push("moneyTeam1", "moneyTeam2", "moneyDrawLine")
			console.log(requiredParams)
			if(checkParams(requiredParams, query))
			{
				var response = {success: "true"}
				
				res.send(response);
			}
			else
			{
				var response = {error: "bad params"}
				res.send(response)
			}
		}
		else
		{
			var response = {error: "need type param"}
			res.send(response)
		}

    	// res.send(query.type === "money");
    });
}

// Function verifies that api has all parameters
var checkParams = function(checkArray, query)
{
	for (i = 0; i< checkArray.length; i++)
	{
		// console.log(checkArray[i] + " : " + query[i])
		if (typeof query[checkArray[i]] === "undefined")
		{
			console.log("missing param: " + checkArray[i]);
			return false;
		}
	}

	return true;
}

 
module.exports = bet;
