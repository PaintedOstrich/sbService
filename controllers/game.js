
/*
 * Retrieve game info for bets
 */

 var util = require('util')
 
 var resMes = require('../user_modules/responseMessages')
 var gameModel = require('../models/game')
 var cUtil = require('../user_modules/cUtil');
  
var gameModel = require('../models/game')

var getGames = function(res, sport)
{
  if (sport)
  {
    gameModel.getGamesForSport(sport,function(err, val)
    {
      if (err) res.send(resMes.createErrorMessage(err));
      else
      {
        res.send(resMes.createDataMessage(val))
      }
    })
  }
}

module.exports = 
{
  getGames : getGames,
}