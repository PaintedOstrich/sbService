/**
* Bet Model
*/

var mongoose = require('mongoose')

var singleSportBet= new mongoose.Schema({
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

mongoose.model('Bet', singleSportBet);