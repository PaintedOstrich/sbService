
/*
 * User Controller
 */

 var util = require('util')
 
 var errorHandler = require('../user_modules/errorHandler')
 var user = require('../models/user')
 var cUtil = require('../user_modules/cUtil');
  
var getUserBalance = function(res, userid)
{
	user.getUserBalance(userid, function(err, data)
	{
		err && errorHandler.send(res, err)
		res.send(data);	
	})
}

module.exports = 
{
	getUserBalance:getUserBalance,	
}