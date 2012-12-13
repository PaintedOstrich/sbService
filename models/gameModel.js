/*
 *	Team Ids for Each Game, rather than betting on strings
 */

var redClient = require('../config/redisConfig')()

var cUtil = require('../user_modules/cUtil');

var base = require('./base');
var util = require('util');
var error = require('../user_modules/errorHandler')
var datetime = require('../user_modules/datetime')

var teamNameIdHash = 'teamNamesHash';

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
	try {
		redClient.hexists(teamNameIdHash, teamName, function(err, doesExist) {
			if (!doesExist) {
				// generate new team id and return
				generateUniqueTeamId(teamNameIdHash, function(err, newTeamId) {
					saveTeamNameIdMapping(teamNameIdHash, teamName, newTeamId, cb)
				})
			}
			else {
				redClient.hget(teamNameIdHash, teamName, cb);
			}
		})
	}
	catch(err) {
		cb(err)
	}
}

var getPresetTeamIdFromName = function(teamName, cb) {
	try {
		redClient.hget(teamNameIdHash, teamName, cb);
	}
	catch (e) {
		throw e;
	}
}

var getUniqueTeamIds = function(teamNames, cb)
{
	var totalCount = teamNames.length;
	var finishedCount = 0;

	// if no keys, return
	if (totalCount == 0) {
		cb();
	}

	try {
		var teamNamesToIds = {};
		for (var index in teamNames) {
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
			cb(null, teamId)
		})
	})
}

// generates uinque team id using a counter
var generateUniqueTeamId = function(teamNameIdHash, cb) {
	redClient.HINCRBY(teamNameIdHash, 'teamIds', 1, cb);
}

module.exports = 
{
	getUniqueTeamIds : getUniqueTeamIds,
	getUniqueTeamId : getUniqueTeamId,
	getPresetTeamIdFromName : getPresetTeamIdFromName
}