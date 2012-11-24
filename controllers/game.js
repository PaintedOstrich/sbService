
/*
 * Retrieve game info for bets
 */

 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')
 var gameModel = require('../models/game')
 var cUtil = require('../user_modules/cUtil');
  
var gameModel = require('../models/game');

var getGames = function(sport, cb)
{
  try
  {
     gameModel.getGamesForSport(sport,cb)
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