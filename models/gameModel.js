/*
 *	Game Database Wrapper
 */

var redClient = require('../config/redisConfig')()

var cUtil = require('../user_modules/cUtil');

var base = require('./base');
var util = require('util');
var error = require('../user_modules/errorHandler')
var datetime = require('../user_modules/datetime')

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

var teamNameIdHash = 'teamNamesHash';

var getTeamNames = function(sport)
{
	console.log("get team names for " + sport + " is "+ getTeamNames)
}

// returns error in cb or null answer
var getGameIdFromHeaderAndDate = function(possibleGameId, header, datestring, cb)
{
	var date = new Date(datestring)
	var timestring = date.yyyymmdd()
	var betsForGameKey = getGameIdKey(header, timestring);	
	if (betsForGameKey)
	{
		redClient.setnx(betsForGameKey, possibleGameId, function(err)
		{
			redClient.get(betsForGameKey,cb);
		})
	}
	else cb(error.errorCodes.inproperGameIdKey)
}

// gets unique team id or creates one if it doesn't exist
var getUniqueTeamId = function(teamName, cb) {
	try
	{
		redClient.hexists(teamNameIdHash, teamName, function(err, doesExist) {
			if (!doesExist) {
				// generate new team id and return
				generateUniqueTeamId(teamNameIdHash, function(err, newTeamId) {
					saveTeamNameIdMapping(teamNameIdHash, teamName, newTeamId, cb)
				})
			}
			else
			{
				redClient.hget(teamNameIdHash, teamName, cb);
			}
		})
	}
	catch(err)
	{
		cb(err)
	}
}

var getUniqueTeamIds = function(teamNames, cb)
{
	var totalCount = teamNames.length;
	var finishedCount = 0;

	// if no keys, return
	if (totalCount == 0)
	{
		cb();
	}

	try {
		var teamNamesToIds = {};
		for (var index in teamNames)
		{
			var teamName = teamNames[index];

			getUniqueTeamId(teamName, function(teamName) {
				// pass callback using closure to key unique betid in scope per call	
				return function setTeamIdForName(err, teamId) {
					teamNamesToIds[teamName] = teamId;
					finishedCount++;
					if (totalCount == finishedCount) {
						cb(null, teamNamesToIds)
					}
				}
			}(teamName))
		}
	}
	catch(err) {
		cb(err);
	}
}

// maps teamName -> teamId and teamId -> teamName
var saveTeamNameIdMapping = function(teamNameIdHash, teamName, teamId, cb){
	redClient.hset(teamNameIdHash, teamName, teamId, function(err) {
		redClient.hset(teamNameIdHash, teamId, teamName, function(err) {
			cb(teamId)
		})
	})
}

// generates uinque team id using a counter
var generateUniqueTeamId = function(teamNameIdHash, cb) {
	redClient.HINCRBY(teamNameIdHash, 'teamIds', 1, cb);
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

// returns whether game has been completely processed
var gameHasBeenProcessed = function(gameId,cb)
{
	var gameKey = getGameKey(gameId);
	redClient.hget(gameKey, 'hasBeenProcessed', cb);
}

// cleans up game and marks it so it is not processed again
var setProcessGameComplete = function(gameId, cb) {
	try {
		getGameInfo(gameId, function(err, gameInfo) {
			var gameKey = getGameKey(gameId);
			redClient.hset(gameKey, 'hasBeenProcessed', 'true', function(err) {
				// FIXME need callback on removeGame function???
				removeGameFromList(gameId, gameInfo.sport, cb)
			})
		})
	}
	catch(err) {
		cb(err)
	}
	
}

// returns an object with all bet info for a given game
var getGameInfo = function (gameId, cb)
{
	var key = getGameKey(gameId);
	try 
	{
		redClient.hgetall(key, function(err, betInfo)
		{
			if (err){
				cb(err);
			} 

			// result will be undefined if bet doesn't exist
			cb(null, betInfo);	
		});
	}
	catch(err) {
		cb(err)
	}
	
}

// shouldDoGameUpdate
var shouldDoGameUpdate = function(gameId, thisUpdate, cb) {
	try
	{
		var thisDate = new Date(thisUpdate);
		var gameKey = getGameKey(gameId);
		redClient.hget(gameKey, 'lastUpdate', function(err, datestring) {
			if (!datestring) {
				cb(null, true);
			}
			else {
				var lastUpdate = new Date(datestring);
				// don't update if this upate is before last update
				cb(null, thisDate.isBefore(lastUpdate) );
			}
		})
	}
	catch(err) {
		cb(err)
	}
}

// sets info for game into persistent redis store
var setGameInfo = function(gameId, gameData, cb)
{
	var teamNames = [gameData.team1Name,gameData.team2Name];
	try
	{
		shouldDoGameUpdate(gameId, gameData.lastUpdate, function(err, doUpdate) {
			if (doUpdate) {
				// update games since this update is more recent than the one currently stored
				getUniqueTeamIds(teamNames, function(err, teamNamesToIds) {
					
					if (!err) {
						gameData['team1Id'] = teamNamesToIds[gameData.team1Name];
						gameData['team2Id'] = teamNamesToIds[gameData.team2Name];	
					}

					var hashKey = getGameKey(gameId);

					base.setMultiHashSetItems(hashKey, gameData, function(err)
					{
						if (err) cb (err);

						addGameToList(gameId, gameData.sport)

						cb();
					})
				})
			}
			else {
				// 
				cb()
			}
		})
		
	}
	catch(err) {
		cb(err)
	}
}

// adds game to list of betting options for the sport
var addGameToList = function(gameId, sport) {
	redClient.sadd(getGameKey(sport), gameId);
}

// removes the game from this list
var removeGameFromList = function(gameId, sport, cb) {
	redClient.srem(getGameKey(sport), gameId, cb);
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
		for (i = 0; i < gameIds.length; i++) {
			hashKeys[i] = getGameKey(gameIds[i])	
		}

		base.getMultiHashSets(hashKeys, fields, cb)
	})
}

var getTeamNamesAndDateForGames = function(gameIds, cb)
{
	var fields = ['gdate', 'team1Name', 'team2Name'];
	try {
		base.getMultiHashSetsAsObject(gameIds, getGameKey, fields, cb);	
	}
	catch(err) {
		cb(err)
	}
}

module.exports = 
{
	getTeamNames : getTeamNames,
	setGameInfo : setGameInfo,
	getGameInfo : getGameInfo,
	getGamesForSport : getGamesForSport,
	getTeamNamesAndDateForGames : getTeamNamesAndDateForGames,
	addBetForGame : addBetForGame,
	getBetsForGame : getBetsForGame,
	getGameIdFromHeaderAndDate : getGameIdFromHeaderAndDate,
	gameHasBeenProcessed : gameHasBeenProcessed,
	getUniqueTeamIds : getUniqueTeamIds,
	removeGameFromList : removeGameFromList,
	setProcessGameComplete : setProcessGameComplete,
}