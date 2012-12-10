
/*
 * Retrieve game info for bets
 */

 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')
 var gameModel = require('../models/gameModel')
 var cUtil = require('../user_modules/cUtil');

 var mongoose = require('mongoose');
 var Game = mongoose.model('Game');
 var gaemModel = require('../models/gameModel')
  
var saveGame = function(newGameInfo, cb){
  var query = Game.find();
  console.log('adding : \n' + newGameInfo.header + "\n" + newGameInfo.lastUpdate)
  var gameDate = new Date(newGameInfo.gdate);
  query.and([{header: newGameInfo.header}, {gdate : newGameInfo.gdate}]).exec(function(err, oldGameInfo){
    if (oldGameInfo.length){
      // found old game
      // makes update if this update is sooner;

      if (oldGameInfo[0].lastUpdate < new Date(newGameInfo.lastUpdate)){
         console.log('newer update')
         Game.findByIdAndUpdate(oldGameInfo[0]._id, newGameInfo, cb)
       }
      else {
        console.log('older update')
        cb()
       }
    }
    else {
      var teamNames = [newGameInfo.team1Name,newGameInfo.team2Name];
      console.log('first time adding game\n' + newGameInfo.header + '   ' + newGameInfo.gdate);
      gameModel.getUniqueTeamIds(teamNames, function(err, teamNamesToIds) {
        // get unique team ids for these games, to pass to client  
        newGameInfo['team1Id'] = teamNamesToIds[newGameInfo.team1Name];
        newGameInfo['team2Id'] = teamNamesToIds[newGameInfo.team2Name];

        new Game(newGameInfo).save(cb);
      })
    }  
  })
}

var getGames = function(sport, cb)
{
  Game.find({wagerCutoff: {$gte: Date.now()}}, cb);
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
  saveGame : saveGame
}