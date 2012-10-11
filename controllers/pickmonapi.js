// To be run through cron job.
// Retrieves, parses, and stores info for betting line
//http://api.pickmonitor.com/lines.php?uid=15042&key=36e93

// Usage : s.getBetInfo(s.base, s.parseGames)
var querystring = require('querystring');
var cUtil = require('../user_modules/cUtil')
var restler = require('restler');
var xml2js = require('xml2js');
var async = require('async');
var util = require('util');

var getBetInfo = function(betObj, shouldDoFullUpdate, cb)
{
	var request = restler.get(betObj.getUrl(shouldDoFullUpdate));
	// console.log(betObj.getUrl(shouldDoFullUpdate));

    request.on('fail', function(data) {
      cb();
    });

    request.on('success', function(data) {
      cb(data)
    });
};

var parseGames = function(result) {
	
	try
	{
		// Did api call auto parse result?
		var gamesArr = result['lines']['game'];		
		
		if (!gamesArr)
		{
			// Was result empty?
			console.log("no games present");
		}
		else
		{
			// parse each individual game and update
			async.forEach(gamesArr, parseGame, function(err){
				console.log(err)
			});
		}
	}
	catch(err)
	{
		// let's try parsing hte response manually (restler didn't do it)
		try
		{
			var parser = new xml2js.Parser();
		    parser.parseString(result, function (err, result) {
      			if (err)
      			{
      				console.log('unable to parse response: '+ err)
      			}
      			else
      			{
      				// get all games
					gamesArr = result['lines']['game'];
					async.forEach(gamesArr, parseGame, function(err){
						if(err)console.log(err)
					});
      			}
    		});
		}
		catch(err)
		{
			console.log('unable to parse response: '+ err)
		}
	}
	
}

// Creates new game object
// Validates that the update time is new
// Parses all data into a pretty array 
var parseGame = function(item, callback) {
	var game = new PickMonitorGame(item);
	
	if(game.blnUpdateGame() === true) {
		game.setDataArr();
		var gameData = game.getDataArr();
		if(game.blnGameOver() === true) {			
			
			// pass item, not game for clarity on bet processing side
			executeBets(item);	
		}
		// console.log(gameData);	
	}
	callback();
}

// Retrieve all bets
// Set game object 
// Process
var executeBets = function(item){
	var game = new PickMonitorGame(item);
	return false;
}

// Master function to retrieve all data about a game
// Helper functions specific to this xml feed and element location
var PickMonitorGame = function(item) {	
	var game = item;
	
	// to-do: compare external vs internal updated times
	// key - value lookup of game id and last updated
	this.blnUpdateGame = function() {
		return true;
	}

		// filled in by helper functions
	var dataArr = {};
	
	this.getDataArr = function() {
		if (typeof dataArr === 'undefined') {			
			return false;	
		} else {
			return dataArr;
		}
	}
	
	this.blnGameOver = function() {
		winner = getWinner();
		if (typeof winner === 'undefined' || winner.length <= 1) {
			return false;
		} else {
			true;
		}			
	}
	
	// parses data out of array into object
	this.setDataArr = function(){
	    dataArr.id=getGameId();
	    dataArr.date=getGameDate();
	    dataArr.header=getHeader();
	    dataArr.team1=getTeam1();
	    dataArr.team2=getTeam2();
	    dataArr.sport=getSport();
	    dataArr.lastUpdate=getLastUpdate();
	    dataArr.wagerCutoff=getWagerCutoff();
	    dataArr.moneyTeam1=getMoneyTeam1();
	    dataArr.moneyTeam2=getMoneyTeam2();
	    dataArr.moneyDraw=getMoneyDraw();
	    dataArr.spreadTeam1=getSpreadTeam1();
	    dataArr.spreadTeam2=getSpreadTeam2();
	    dataArr.spreadPoints=getSpreadPoints();
	    dataArr.totalPoints=getTotalPoints();
	    dataArr.totalOver=getTotalOver();
	    dataArr.totalUnder=getTotalUnder();
		
		// console.log(util.inspect(dataArr, true, 10));
		// console.log(util.inspect(dataArr, true, 3));
		// console.log(dataArr);
		// remove id before passing all fields
		var gameId = dataArr['id'];
		debugger;
		gameModel.setGameInfo(dataArr['id'], dataArr, function(err)
		{
			if (err) console.log(err)
			else console.log("update complete")
		})

	}
		
	// Beginning of helper functions	
	var getGameId = function() {
		return game.id[0];
	}
		
	var getHeader = function() {
		return game.header[0];
	}
	
	var getSport = function() {
		return game.sportsubtype[0];
	}
	
	var getGameDate = function() {
		return game.gamedate[0];
	}
	
	var getLastUpdate = function() {
		return game.last_update[0];
	}
	
	var getTeam1 = function() {
		return game.team1[0]['name'][0];
	}
	
	var getTeam2 = function() {
		return game.team2[0]['name'][0];
	}
	
	var getWagerCutoff = function() {
		return game.line[0]['wagercutoff'][0];
	}
	
	var getMoneyTeam1 = function() {
		return game.line[0]['money'][0]['team1'][0];
	}
	
	var getMoneyTeam2 = function() {
		return game.line[0]['money'][0]['team2'][0];
	}
	
	var getMoneyDraw = function() {
		return game.line[0]['money'][0]['draw'][0];
	}
	
	var getSpreadTeam1 = function() {
		return game.line[0]['spread'][0]['team1'][0];
	}
	
	var getSpreadTeam2 = function() {
		return game.line[0]['spread'][0]['team2'][0];
	}
	
	var getSpreadPoints = function() {
		return game.line[0]['spread'][0]['points'][0];
	}
	
	var getTotalPoints = function() {
		return game.line[0]['total'][0]['points'][0];
	}
	
	var getTotalOver = function() {
		return game.line[0]['total'][0]['over'][0];
	}
	
	var getTotalUnder = function() {
		return game.line[0]['total'][0]['under'][0];
	}

	var getWinner = function() {
		return game.line[0]['score'][0]['winner'];
	}
}

// Bet Objects to get info from pickmonitor
var sportBetApi = {
	sportType : 'generic',

	basePath: "http://api.pickmonitor.com/lines.php?",
	credentials:
	{
		uid: "15042",
		key: "36e93",
	},
	doFullUpdate:
	{
		full_call:'1'
	},

	getUrl : function (doFullCall)
	{
		var url= this.basePath+querystring.stringify(this.credentials);
		if (doFullCall ==true)
		{
			url += '&' + querystring.stringify(this.doFullUpdate);
		}

		if (cUtil.getNumElements(this.params)>0)
		{
			url += '&' + querystring.stringify(this.params);
		}

		return url;
	},
	getGames : function()
	{

	},
};

var NFL = Object.create(sportBetApi);
NFL.params =
{
	sports:"football-NFL",
}

var sportsList = 
{
	NFL: NFL,
}

// // set sports all list to update all sports
// function addAllSports() {
// 	var ALL = [];
// 	for (var sport in sportsList)
// 	{
// 		ALL.push(sport);
// 	}
// 	sportsList.ALL = ALL
// };
// addAllSports();

var checkForUpdates = function()
{

}

var updateAllGames = function(sportName)
{
	if (sportName === "ALL")
	{
		for (var sport in sportsList)
		{
			getBetInfo(sport, true, parseGames);
		}
	}
	else
	{
		if (sportsList[sportName] !== "undefined")
		{
			getBetInfo(sportsList[sportName], true, parseGames);
		}
		else
		{
			console.log("Err: did not pass valid sport name to update api")
		}
	}
	
}

module.exports = {
	base : sportBetApi,
	NFL : NFL,
	getBetInfo : getBetInfo,
	parseGames : parseGames,
	checkForUpdates : checkForUpdates,
	updateAllGames : updateAllGames,
}

