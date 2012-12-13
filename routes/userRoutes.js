/*
 * User routing
 */
 var url = require('url');
 var util = require('util')

 var userController = require('../controllers/userController')
 var userModel = require('../models/userModel')
 var errorHandler = require('../user_modules/errorHandler')
 var fbHandle = require('../user_modules/fb/fbHandle');

var userHandle = function(app) {
    // Get Current User's balance 
    app.get('/api/user/:uid/balance', function(req, res) {
		var uid = req.params.uid;
			userController.getUserBalance(uid, function(err, data) {
				if (err) {
					errorHandler.send(res, err)
				} 
				else {
					data = data || 0;
					res.send(data)
				}
			});
    });

    /* Check if user is correctly logged in, and return batch info
	 *  Consists of bets to accept, decline, current, and past
	 *  Current Balance 
	 *  
	 */
  app.post('/api/user/login/:signedrequest', function(req, res) {
  	var token = req.body;

		fbHandle.login(token, req.params.signedrequest, function(err, uid)
		{
			if (err) {
				errorHandler.send(res, err)
			}
			else
			{
				// get desired base login info to start up app
				userController.getBaseUserInfo(uid, function(err, baseInfo) {
					if (err) {
						errorHandler.send(res, err);
					}
					else {
						res.send(baseInfo)
					}
				})
			}
		})
  });

	app.get('/api/user/:uid/bets', function(req, res) {
		// returns bets in four categories
		// past/current/userAccept/pendingAccept
		var uid = req.params.uid;

		userController.getUserBets(uid, function(err, data)
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