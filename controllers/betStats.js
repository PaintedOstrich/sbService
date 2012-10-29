
var betStatsModel = require('../models/betStats');
var resMes = require('../user_modules/responseMessages')
var errorHandler = require('../user_modules/errorHandler')

var getRecentBets = function(res)
{
	betStatsModel.getRecentBets(function(err, data)
	{
		debugger;
		err && errorHandler.send(res, err);
		res.send(data);
	})
}

module.exports = 
{
	getRecentBets:getRecentBets,
}