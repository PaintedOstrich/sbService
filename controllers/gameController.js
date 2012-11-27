
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
  	var fields = ["gid","gdate", "header", "team1", "team2", "sport", "wagerCutoff", "spreadTeam1", "spreadTeam2"]; 
    gameModel.getGamesForSport(sport,fields,cb)
  }
  catch(err)
  {
    cb(err)
  }
}

var updateBetsPerGameEnd = function()
{

}

module.exports = 
{
  getGames : getGames,
}