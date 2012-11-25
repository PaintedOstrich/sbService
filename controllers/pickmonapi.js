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

var gameModel = require('../models/game')
var datetime = require('../user_modules/datetime')

/* Exported Functions */
var checkForUpdates = function()
{
	getBetUpdates(false);
}

var updateAllGames = function()
{
	getBetUpdates(true);
}
/* End Exported Functions */

var getBetUpdates = function(shouldDoFullUpdate)
{
	var request = restler.get(sportBetApiHandler.getUrl(shouldDoFullUpdate));
	console.log(sportBetApiHandler.getUrl(shouldDoFullUpdate, true));

    request.on('fail', function(err) 
    {
      console.log('Error: Unable to reach Pick Mon Api: ', err);
      // mix panel log here
    });

    request.on('success', function(data) 
    {
      parseGames(data);
    });
};

var parseGames = function(result) 
{
	try
	{
		// Did api call auto parse result?
		var gamesArr = result['lines']['game'];		

		// parse each individual game and update
		async.forEach(gamesArr, parseGame, function(err)
		{
			console.log(err)
		});
	}
	catch(err)
	{
		// let's try parsing hte response manually (restler didn't do it)
		try
		{
			var parser = new xml2js.Parser();
		    parser.parseString(result, function (err, result) 
		    {
      			if (err)
      			{
      				// error parsing result from xml to json
      				throw err;
      			}
      			else
      			{
      				// get all games
					gamesArr = result['lines']['game'];
					if (typeof gamesArr === "undefined")
					{
						console.log('no games to update')
					}
					else
					{
						async.forEach(gamesArr, parseGame, function(err){
							if(err) { throw "error processing game :" + err }
						});
					}
					
      			}
    		});
		}
		catch(err)
		{
			console.log('Error: unable to process game due to '+ err)
		}
	}
	
}

// Creates new game object
// Validates that the update time is new
// Parses all data into a pretty array 
var parseGame = function(item, callback) {
	var game = new pickMonitorGame(item);
	game.process();
}

// Master function to retrieve all data about a game
// Helper functions specific to this xml feed and element location
var pickMonitorGame = function(game) {	
	// initialize private variables to properties of game
	this._g = {};

	this._g.gid=game.id[0];
    this._g.gdate=game.gamedate[0];
    this._g.header=game.header[0];
    this._g.team1=game.team1[0]['name'][0];
    this._g.team2=game.team2[0]['name'][0];
    this._g.sport=game.sportsubtype[0];
    this._g.lastUpdate=game.last_update[0];
    this._g.wagerCutoff=game.line[0]['wagercutoff'][0];
    this._g.moneyTeam1=game.line[0]['money'][0]['team1'][0];
    this._g.moneyTeam2=game.line[0]['money'][0]['team2'][0];
    this._g.moneyDraw=game.line[0]['money'][0]['draw'][0];
    this._g.spreadTeam1=game.line[0]['spread'][0]['team1'][0];
    this._g.spreadTeam2=game.line[0]['spread'][0]['team2'][0];
    this._g.spreadPoints=game.line[0]['spread'][0]['points'][0];
    this._g.totalPoints=game.line[0]['total'][0]['points'][0];
    this._g.totalOver=game.line[0]['total'][0]['over'][0];
    this._g.totalUnder=game.line[0]['total'][0]['under'][0];

    this._g.winner = game.line[0]['score'][0]['winner'][0];
    if (typeof this._g.winner === "object")
    {
    	// winner not set, so value will be undefined
    	this._g.winner = null;
    }

    this._g.period = game.line[0]['perioddesc'][0]; // used to determine whether bet update is end of game

    // so this field will be initialized false in db
    this._g.hasBeenProcessed = false;
}

pickMonitorGame.prototype.process = function()
{
	// lose scope after 1st callback
	var that = this;

    try
	{
		if (that._g.gid && that._g.header && that._g.gdate)
		{
			var timestring = new Date(that._g.gdate);
		    gameModel.getGameIdFromHeaderAndDate(that._g.gid, that._g.header, timestring.yyyymmdd(), function(err, gameId)
		    {
	    		if (err) throw err;
	    		console.log('game id is ' + gameId)
			    // on ended games
			    if (that.isFinalScore())
			    {
			    	console.log('is final score');
			    	gameModel.gameHasBeenProcessed(gameId, function(err, hasBeenProcessed)
			    	{
			    		console.log('has been processed: '+ hasBeenProcessed);			    		
			    		if (!hasBeenProcessed)
			    		{
				    		console.log("winner is " + util.inspect(that._g.winner, true, 3));

				    		// get all bet games and process each winner. set hasbeenProcessed to false once all games are processed.
				    		// if something happens and there is an error in the middle of processing games, this field will not be set,
				    		// and next update will try and finish processing by checking each individual game to make sure it has not been processed before upating user balances
				    		
				    		// game model

			    		}
			    	
			    	})
			    }
			    else
			    {
					// console.log(util.inspect(dataArr, true, 10));					
					gameModel.setGameInfo(gameId, that._g, function(err)
					{
						if (err) console.log(err)
					})
			    }
			})
		}
		else
		{
			// game is not defined
		}
    }
    catch(e)
	{
		console.log(e);
	}
}
	
pickMonitorGame.prototype.isFinalScore = function()
{
	// check api properties to determine ended game
	if (typeof this._g.period !== "undefined" && typeof this._g.winner !=="object")
	{
		return this._g.period === "Game";	
	}
	
	else 
	{
		return false;
	}
}

// Bet Objects to get info from pickmonitor
var sportBetApiHandler = {
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
	doGradedGames:
	{
		// gets both graded and non graded games if 2, 1 just graded
		graded:'1'
	},
	params:
	{
		// this should be a comma deliminated list (so football-NFL,basketball-NBA, etc.)
		sports:"football-NFL",
	},
	getUrl : function (doFullCall, doGradedGames)
	{
		var url= this.basePath+querystring.stringify(this.credentials);
		if (doFullCall)
		{
			url += '&' + querystring.stringify(this.doFullUpdate);
		}

		if (doGradedGames)
		{
			url += '&' + querystring.stringify(this.doGradedGames);
		}

		if (cUtil.getNumElements(this.params)>0)
		{
			url += '&' + querystring.stringify(this.params);
		}

		return url;
	}
};

/* EXAMPLE EXTENSION TO LIMIT CALL TO ONE SPORT
var NFL = Object.create(sportBetApi);
NFL.params =
{
	sports:"football-NFL",	
}
*/ 

module.exports = {
	// for testing and mocking
	sportBetApiHandler : sportBetApiHandler,
	parseGames : parseGames,

	// for prod
	checkForUpdates : checkForUpdates,
	updateAllGames : updateAllGames,
}

