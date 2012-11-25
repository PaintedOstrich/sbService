/*
 *	Game Database Wrapper
 */

var redClient = require('../config/redisConfig')()

var cUtil = require('../user_modules/cUtil');

var base = require('./base');

var error = require('../user_modules/errorHandler')

// get game id key - generated from header since each game from pick mon generates multiple ids
var getGameIdKey = function(header, yyyymmdd)
{
	try
	{
		if (yyyymmdd == "Invalid Date")
		{
			throw "Error: datetime passed invalid date";
		}
	}

	catch (e)
	{
		console.log(e)
		return null;
	}

	
	return 'gameId|' + header + '|' + yyyymmdd;
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

// gets the key for all bets on this game
var getBetsForGameKey = function(gameId)
{
	return 'game|' + gameId + + '|bets';
}

var getTeamNames = function(sport)
{
	console.log("get team names for " + sport + " is "+ getTeamNames)
}

// returns error in cb or null answer
var getGameIdFromHeaderAndDate = function(possibleGameId, header, datetime, cb)
{
	var betsForGameKey = getGameIdKey(header, datetime);	
	if (betsForGameKey)
	{
		redClient.setnx(betsForGameKey, possibleGameId, function(err)
		{
			redClient.get(betsForGameKey,cb);
		})
	}
	else cb(error.errorCodes.inproperGameIdKey)
}

// add user bet for this game
var addBetForGame = function(userBetIdKey, gameId, cb)
{
	var gameBetKey = getBetsForGameKey(gameId);
	redClient.sadd(gameBetKey, userBetIdKey, cb)
}

// get all bets per game
var getBetsForGame = function(gameId)
{
	var gameKey = getBetsForGameKey(gameId);
	redClient.smembers(gamekey, cb);
}

var gameHasBeenProcessed = function(gameId,cb)
{
	var gameKey = getGameKey(gameId);
	redClient.hget(gameKey, 'hasBeenProcessed', cb);
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

		cb();
	})
}

// adds game to list of betting options for the sport
var addGameToList = function(gameId, sport)
{
	redClient.sadd(getGameKey(sport), gameId);
}

// get games for sport 
// pass in fields to get specific fields
var getGamesForSport = function(sport, fields, cb)
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

		base.getMultiHashSets(hashKeys, fields, cb)
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
	getTeamNamesFromGame : getTeamNamesFromGame,
	addBetForGame : addBetForGame,
	getBetsForGame : getBetsForGame,
	getGameIdFromHeaderAndDate : getGameIdFromHeaderAndDate,
	gameHasBeenProcessed : gameHasBeenProcessed,
}