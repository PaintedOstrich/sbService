
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
  var gameDate = new Date(newGameInfo.gdate);
  query.and([{header: newGameInfo.header}, {gdate : gameDate}]).exec(function(err, oldGameInfo){
    if (oldGameInfo.length){
      // found old game
      // makes update if this update is sooner;

      if (oldGameInfo[0].lastUpdate < new Date(newGameInfo.lastUpdate)){
        // newer update
        // since game id changes, remove it, so all bets will have the original game id
        // -----> STUPID PICK MON API ----> caused so much extra work!!!
         delete(newGameInfo.gid);
         Game.findByIdAndUpdate(oldGameInfo[0]._id, newGameInfo, cb)
       }
      else {
        // older update, don't do anything
        cb()
       }
    }
    else {
      var teamNames = [newGameInfo.team1Name,newGameInfo.team2Name];
      // adding new game, get team names
      gameModel.getUniqueTeamIds(teamNames, function(err, teamNamesToIds) {
        // get unique team ids for these games, to pass to client  
        newGameInfo['team1Id'] = teamNamesToIds[newGameInfo.team1Name];
        newGameInfo['team2Id'] = teamNamesToIds[newGameInfo.team2Name];

        // save game info
        new Game(newGameInfo).save(cb);
      })
    }  
  })
}

// gets game info from header and date
// this necessary since api doesn't pass us unique game ids.
var getGameIdFromInfo = function(header, date, cb){
  if (typeof date !== 'object'){
    date = new Date(date);
    if (date == 'Invalid Date') {
      console.warn('passed invalid date to getGameIdFromInfo')
      cb('Invalid Date');
    }
  }
  fields = {
    'gid':1
  }
  
  var query = Game.findOne(null, fields);
  query.and([{header: header}, {gdate : date}]).exec(cb);
}

/*
 * updates game complete flag to true
 * @param: game - > mongoose model instance
 */ 
var setProcessGameComplete = function(game, cb) {
  game.update({processed:true}, null, cb)
}

var getGames = function(sport, cb)
{
  var fields = {
    'gid':1,
    'gdate':1,
    'header':1, 
    'team1Name':1,
    'team1Id':1,
    'team2Name':1,
    'team2Id':1,
    'sport':1,
    'wagerCutoff':1, 
    'spreadTeam1':1, 
    'spreadTeam2':1,
    '_id':0
  }; 
  Game.find({wagerCutoff: {$gte: Date.now()}}, fields, cb);
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
  saveGame : saveGame, 
  getGameIdFromInfo : getGameIdFromInfo,
  setProcessGameComplete : setProcessGameComplete,
}