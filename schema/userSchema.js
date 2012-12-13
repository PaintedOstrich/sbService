 /*
  *   Defines User Schema
  */

var cUtil = require('../user_modules/cUtil')

module.exports = function(mongoose)
{
    var Schema = mongoose.Schema

    var User = new Schema({
        uid           :  {type: String, index: { unique: true }, required: true}
      , firstname     : String 
      , lastname      : String
      , name          : String 
      , username      : String
      , balance       : { type: Number, default: 0.00, get: cUtil.trimToTwoDecimalPlaces}
      , joined        : { type: Date, default: Date.now }    
    });

    mongoose.model('User', User);
}

