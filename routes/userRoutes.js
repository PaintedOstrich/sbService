/*
 * User routing
 */
 var url = require('url');
 var util = require('util')

 var userController = require('../controllers/userController')
 var userModel = require('../models/userModel')
 var errorHandler = require('../user_modules/errorHandler')

var userHandle = function(app) {
    // Get Current User's balance 
    app.get('/api/user/:uid/balance', function(req, res) {
		var uid = req.params.uid;
		userModel.getUserBalance(uid, function(err, data) {
			if (err) {
				errorHandler.send(res, err)
			} 
			else {
				res.send(data)
			}
		});
    });

    /* Check if user is correctly logged in, and return batch info
	 *  Consists of bets to accept, decline, current, and past
	 *  Current Balance 
	 *  
	 */
    app.get('/api/user/login/:signedrequest', function(req, res) {
		userController.login(req.params.signedrequest,function(err, data)
		{
			if (err) {
				errorHandler.send(res, err)
			}
			else
			{
				var uid = data.user_id;
				userController.getBaseUserInfo(uid, function(err, baseInfo) {
					if (err) {
						errorHandler.send(res, err);
					}
					else {
						send(baseInfo)
					}
				})
			}
		})
    });

	app.get('/api/user/:uid/bets', function(req, res) {
		// can pass in one of four options as query type ?filter = 
		// past/current/userAccept/pendingAccept
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;

		var filter = query.filter;
		var uid = req.params.uid;

		userController.getUserBets(uid, filter, function(err, data)
		{
			if(err) {
				errorHandler.send(res, err)
			}
			else {
				res.send(data)
			}
		});
	});
}

module.exports = userHandle;