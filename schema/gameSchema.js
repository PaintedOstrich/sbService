 /*
  *   Defines Game Schema
  */
module.exports = function(mongoose)
{
  var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

  var Game = new Schema({
      gid            : String 
    , gdate          : Date 
    , header         : String 
    , team1Name      : String
    , team1Id        : String
    , team2Name      : String
    , team2Id        : String  
    , sport          : String  
    , spreadTeam1    : Number
    , spreadTeam2    : Number
    , wagerCutoff    : Date
    , winner         : String
    , processed      : Boolean
    , lastUpdate     : Date
  });

  mongoose.model('Game', Game);
}
