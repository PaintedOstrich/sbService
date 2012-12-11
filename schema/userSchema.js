 /*
 *   *   Defines User Schema
 *     */
module.exports = function(mongoose)
{
    var Schema = mongoose.Schema

    var User = new Schema({
        uid           :  {type: String, index: { unique: true }, required: true}
      , firstname     : String 
      , lastname      : String
      , fullname      : String 
      , balance       : Number
      , joined        : { type: Date, default: Date.now }    
    });

    mongoose.model('User', User);
}

