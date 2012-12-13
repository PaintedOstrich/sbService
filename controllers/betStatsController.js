

var mongoose = require('mongoose');
var Bet = mongoose.model('Bet');
var Game = mongoose.model('Game');
var User = mongoose.model('User');

var mUtil = require('../user_modules/mongoUtil')

var getRecentBets = function(num, cb) {
	// get num most recent bets
	Bet.find().limit(num).sort({date:-1}).exec( function(err, bets){
		// get unique userIds from recent bets
		var uids = mUtil.aggregateValuesFromObjects(bets, ['initFBId', 'callFBId']);
		var userFields = {
			firstname:1,
			uid:1, 			
		};

		// get user firstnames from db
		User.find({ uid : { $in : uids } }, userFields, function(err, userInfo) {
			var gameFields = {
				team1Name : 1,
				team1Id   : 1,
				team2Name : 1,
				team2Id   : 1,
			};

			// get unique game ids
			var gameIds = mUtil.aggregateValuesFromObjects(bets, 'gameId');

			Game.find({ gid : { $in : gameIds } }, gameFields, function(err, gameInfo) {
				var results = combineBetInfo(bets, gameInfo, userInfo)
					cb(null, results)
			})
		})
		
	})
}

/*
 *  combine fields in desired result
 *  May want to refactor schema so we don't have to do this
 *  depends on the frequency of this vs. the number of bets vs. storing this as we go.
 */
var combineBetInfo = function(bets, games, users) {
	var results = [];

	for (var i = 0; i < bets.length; i++) {
		var bet = bets[i];
		var initName = mUtil.getValuePairInList('firstname', 'uid', bet.initFBId, users, 'anonymous')
		var otherName = mUtil.getValuePairInList('firstname', 'uid', bet.callFBId, users, 'anonymous')
		var gameId = mUtil.getValuePairInList('gid', 'team1Id', bet.initTeamBetId, games)

		var initTeamName = mUtil.getValuePairInList('team1Name', 'team1Id', bet.initTeamBetId, games)
		if (initTeamName){
			// init user bet on team 1
			var otherTeamName = mUtil.getValuePairInList('team2Name', 'gid', gameId, games)
		}
		else{
			// init user bet on team 2
			var otherTeamName = mUtil.getValuePairInList('team1Name', 'gid', gameId, games)
			var initTeamName = mUtil.getValuePairInList('team2Name', 'gid', gameId, games)
		}

		var amount = bet.betAmount

		var info = {
			amount : amount,
			player1 : initName,
			player1FBId: bet.initFBId,
			player1Bet : initTeamName,
			player2 : otherName,
			player2FBId : bet.callFBId,
			player2Bet :otherTeamName
		}

		results.push(info)
	}

	return results;
}

module.exports = {
	getRecentBets : getRecentBets,
}