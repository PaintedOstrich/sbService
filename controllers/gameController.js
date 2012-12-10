
/*
 * Retrieve game info for bets
 */

 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')
 var gameModel = require('../models/gameModel')
 var cUtil = require('../user_modules/cUtil');

 var mongoose = require('mongoose');
 var Game = mongoose.model('Game');
  
var saveGame = function(newGameInfo, cb){
  var query = Game.find();
  debugger;
  query.and([{header: newGameInfo.header}, {gdate : newGameInfo.gdate}]).exec(function(err, oldGameInfo){
    // console.log(oldGameInfo);
    console.log(typeof oldGameInfo._id);
    console.log(oldGameInfo._id);
    console.log(oldGameInfo.gdate);
    console.log(oldGameInfo);
    if (oldGameInfo._id){
      console.log('found old game ' + oldGameInfo.header);
      //update existing game
       Game.update({_id: oldGameInfo._id}, newGameInfo, cb)
    }
    else {
      new Game(newGameInfo).save(cb);
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