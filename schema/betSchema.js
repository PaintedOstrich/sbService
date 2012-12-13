 /*
  *   Defines Bet Schema
  */

var mUtil = require('../user_modules/mongoUtil')

module.exports = function(mongoose)
{
    var Schema = mongoose.Schema
      , ObjectId = Schema.ObjectId;

    var Bet = new Schema({
        initFBId       : String 
      , callFBId       : String 
      , type           : String 
      , betAmount      : {type : Number, get: mUtil.trimToTwoDecimalPlaces}
      , gameId         : String 
      , initTeamBetId  : String  
      , spreadTeam1    : Number
      , spreadTeam2    : Number
      , called         : Boolean
      , processed      : Boolean
      , winningUser    : String
      , date       : { type: Date, default: Date.now }    
    });

    mongoose.model('Bet', Bet);
}
