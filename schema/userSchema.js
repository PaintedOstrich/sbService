 /*
 *   *   Defines User Schema
 *     */
module.exports = function(mongoose)
{
    var Schema = mongoose.Schema
      , ObjectId = Schema.ObjectId;

    var User = new Schema({
        uid            :  {type: String, index: { unique: true }, required: true}
      , firstname     : String 
      , lastname      : String 
      , balance        : Number
      , joined       : { type: Date, default: Date.now }    
    });

    mongoose.model('User', User);
}

