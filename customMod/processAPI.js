
/* 
 * Parse XML API
 */ 
 
var fs = require('fs'),
xml2js = require('xml2js');
var parser = new xml2js.Parser();

var parseSportsData = function() {
	fs.readFile('example1.xml', function(err, data) {
		parser.parseString(data, function (err, result) {
			parseGames(result);
		});
	});
}

// Loops through all games async
// Calls parseGame for each game
var parseGames = function(result) {
	var gamesArr = result['lines']['game'];		
	async.forEach(gamesArr, parseGame, function(err){
			console.log('done iterating');
	});
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
		console.log(gameData);	
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
	this.blnUpdateGame = function() {
		return true;
	}

		// filled in by helper functions
	var dataArr = new Array();
	
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
	
	
	this.setDataArr = function(){
		async.parallel([
		    function(callback){dataArr['id']=getGameId();callback()},
		    function(callback){dataArr['date']=getGameDate();callback()},
		    function(callback){dataArr['league']=getGameLeague();callback()},
		    function(callback){dataArr['team1']=getTeam1();callback()},
		    function(callback){dataArr['team2']=getTeam2();callback()},
		    function(callback){dataArr['sport']=getSport();callback()},
		    function(callback){dataArr['lastUpdate']=getLastUpdate();callback()},
		    function(callback){dataArr['wagerCutoff']=getWagerCutoff();callback()},
		    function(callback){dataArr['moneyTeam1']=getMoneyTeam1();callback()},
		    function(callback){dataArr['moneyTeam2']=getMoneyTeam2();callback()},
		    function(callback){dataArr['moneyDraw']=getMoneyDraw();callback()},
		    function(callback){dataArr['spreadTeam1']=getSpreadTeam1();callback()},
		    function(callback){dataArr['spreadTeam2']=getSpreadTeam2();callback()},
		    function(callback){dataArr['spreadPoints']=getSpreadPoints();callback()},
		    function(callback){dataArr['totalPoints']=getTotalPoints();callback()},
		    function(callback){dataArr['totalOver']=getTotalOver();callback()},
		    function(callback){dataArr['totalUnder']=getTotalUnder();callback()}
		], 
			/* callback */ 
			function(){}
		);
	}
		
	// Beginning of helper functions	
	var getGameId = function() {
		return game.id;
	}
		
	var getGameLeague = function() {
		return game.header;
	}
	
	var getSport = function() {
		return game.sporttype;
	}
	
	var getGameDate = function() {
		return game.gamedate;
	}
	
	var getLastUpdate = function() {
		return game.last_update;
	}
	
	var getTeam1 = function() {
		return game.team1[0]['name'];
	}
	
	var getTeam2 = function() {
		return game.team2[0]['name'];
	}
	
	var getWagerCutoff = function() {
		return game.line[0]['wagercutoff'];
	}
	
	var getMoneyTeam1 = function() {
		return game.line[0]['money'][0]['team1'];
	}
	
	var getMoneyTeam2 = function() {
		return game.line[0]['money'][0]['team2'];
	}
	
	var getMoneyDraw = function() {
		return game.line[0]['money'][0]['draw'];
	}
	
	var getSpreadTeam1 = function() {
		return game.line[0]['spread'][0]['team1'];
	}
	
	var getSpreadTeam2 = function() {
		return game.line[0]['spread'][0]['team2'];
	}
	
	var getSpreadPoints = function() {
		return game.line[0]['spread'][0]['points'];
	}
	
	var getTotalPoints = function() {
		return game.line[0]['total'][0]['points'];
	}
	
	var getTotalOver = function() {
		return game.line[0]['total'][0]['over'];
	}
	
	var getTotalUnder = function() {
		return game.line[0]['total'][0]['under'];
	}

	var getWinner = function() {
		return game.line[0]['score'][0]['winner'];
	}
}
