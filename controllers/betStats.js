
var betStatsModel = require('../models/betStats');
var resMes = require('../user_modules/responseMessages')

var getRecentBets = function(res)
{
	betStatsModel.getRecentBets(function(data)
	{
		res.send(resMes.createDataMessage());
	})
}

module.exports = 
{
	getRecentBets:getRecentBets,
}