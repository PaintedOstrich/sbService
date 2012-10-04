/**
* Bet Model
*/

var mongoose = require('mongoose')

var singleMongoSportBet= new mongoose.Schema({
	initBet:{
		type:Number,
		required: true,
	},
	callBet:{
		type:Number,
		required: true,
	},
	betAmount:{
		type:Number,
		required: true,
		min: 0, 
		max: 100,
	},
})
mongoose.model('Bet', singleMongoSportBet);

//Bet: Constructor
// var RBet = module.exports.RBet = function(p){
//   //p is an optional object
//   var p = p || 0;
//   this.id;
//   this.title = p.title || "";
//   this.body = p.body || "";
//   this.author = p.author || "anon";
//   return this;
// };

// //Post: Save
// Post.prototype.save = function(fn){
//   var self = this;
//   //Get a new id for the post
//   redis.incr('nextPostId', function(err, id){
//     self.id = id;
//     if (err) throw err;
//     //Transaction
//     redis.multi()
//       .set('pid:' + self.id + ':title', self.title)
//       .set('pid:' + self.id + ':body', self.body)
//       .set('pid:' + self.id + ':author', self.author)
//       .lpush('posts', self.id)
//     .exec(function(err){
//       if (err) throw err;
//       fn(err, self.id);
//     });
//   });
//   return this;
// }

