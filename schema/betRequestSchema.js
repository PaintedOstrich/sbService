 /*
  *   Defines Bet Schema
  */

var mUtil = require('../user_modules/mongoUtil')

module.exports = function(mongoose)
{
    var Schema = mongoose.Schema
      , ObjectId = Schema.ObjectId;

    var BetRequest = new Schema({
        initFBId       : String 
      , type           : {type : String, default: 'spread'}
      , betAmount      : {type : Number, get: mUtil.trimToTwoDecimalPlaces}
      , gameId         : String 
      , initTeamBetId  : String  
      , spreadTeam1    : Number
      , spreadTeam2    : Number
      , date           : { type: Date, default: Date.now }
      , numRequestsSent : Number
      , callFBIds      : [String]    
    });

    mongoose.model('BetRequest', BetRequest);
}
