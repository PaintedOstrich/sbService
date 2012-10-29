/*
 *	Game Database Wrapper
 */

var redClient = require('../config/redisConfig')()

var cUtil = require('../user_modules/cUtil');

var base = require('./base');

// gets bet game list key from sport type (string)
var getGameListKey = function(sport)
{
	return 'game|'+ sport+ '|list';
}

// gets bet info key from game id
var getGameKey = function(gameId)
{
	return 'game|' + gameId + '|info';
}

// gets the last updated time for the game
var getLastUpdateKey = function(gameId)
{
	return 'game|' + gameId + '|update';
}

// gets upcoming games for sport
var getUpcomingGamesKey = function(sport)
{
	return 'games|upcoming|' + sport;
}

var getTeamNames = function(sport)
{
	console.log("get team names for " + sport + " is "+ getTeamNames)
}

var addUpComingGames = function(gameIds)
{

}

// returns an object with all bet info for a given game
var getGameInfo = function (gameId, cb)
{
	var key = getGameKey(gameId);
	console.log(key)
	
	redClient.hgetall(key, function(err, betInfo)
	{
		if (err){
			cb(err);
		} 

		// result will be undefined if bet doesn't exist
		cb(null, betInfo);	
	});
}

var setGameInfo = function(gameId, gameData, cb)
{
	var hashKey = getGameKey(gameId);
	
	base.setMultiHashSetItems(hashKey, gameData, function(err)
	{
		if (err) cb (err);

		addGameToList(gameId, gameData.sport)
		console.log(gameData.sport)
		cb();
	})
}

// adds game to list of betting options for the sport
var addGameToList = function(gameId, sport)
{
	redClient.sadd(getGameKey(sport), gameId);
}

// get games for sport 
var getGamesForSport = function(sport, cb)
{

	redClient.smembers(getGameKey(sport), function(err,gameIds)
	{
		if (err) cb(err);
		var hashKeys = [];
		// replace game ids with game hash keys
		for (i = 0; i < gameIds.length; i++)
		{
			hashKeys[i] = getGameKey(gameIds[i])	
		}

		base.getMultiHashSets(hashKeys, cb)
	})
}

var getTeamNamesFromGame = function(gameId, cb)
{
	var fields = ["team1", "team2"];
	base.getMultiHashSets([getGameKey(gameId)], fields, cb);
}

module.exports = 
{
	getTeamNames : getTeamNames,
	setGameInfo : setGameInfo,
	getGameInfo : getGameInfo,
	getGamesForSport : getGamesForSport,
	getTeamNamesFromGame : getTeamNamesFromGame
}