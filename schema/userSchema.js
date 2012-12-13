 /*
  *   Defines User Schema
  */

var mUtil = require('../user_modules/mongoUtil')

module.exports = function(mongoose)
{
    var Schema = mongoose.Schema

    var User = new Schema({
        uid           :  {type: String, index: { unique: true }, required: true}
      , firstname     : String 
      , lastname      : String
      , name          : String 
      , username      : String
      , balance       : { type: Number, default: 0.00, get: mUtil.trimToTwoDecimalPlaces}
      , joined        : { type: Date, default: Date.now }    
    });

    mongoose.model('User', User);
}

/*
 * Current bug in mongoose so getters/casting not always being applied in the correct order 
 *     sometimes balance is not truncated to two decimal places
 *
 *     http://stackoverflow.com/questions/10492041/mongoose-getters-not-being-applied-in-most-straightforward-case
 */