
/*
 * Retrieve game info for bets
 */

 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')
 var gameModel = require('../models/gameModel')
 var cUtil = require('../user_modules/cUtil');
  
var getGames = function(sport, cb)
{
  try
  {
  	var fields = ['gid','gdate', 'header', 'team1Name', 'team1Id', 'team2Name', 'team2Id', 'sport', 'wagerCutoff', 'spreadTeam1', 'spreadTeam2']; 
    gameModel.getGamesForSport(sport,fields,cb)
  }
  catch(err)
  {
    cb(err)
  }
}

// gets game date and team names for each game a user has bet on
var getAssocBetInfo = function(userBets, cb) {
  var gameIds = [];
  for (var index in userBets)
  {
    var gameId = userBets[index].gameId;

    if (gameIds.indexOf() == -1) {
      gameIds.push(gameId);
    }
  }

  gameModel.getTeamNamesAndDateForGames(gameIds, cb);
}
module.exports = 
{
  getGames : getGames,
  getAssocBetInfo : getAssocBetInfo,
}