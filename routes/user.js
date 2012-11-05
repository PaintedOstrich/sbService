/*
 * User routing
 */
 var url = require('url');
 var util = require('util')

 var userController = require('../controllers/user')
 var errorHandler = require('../user_modules/errorHandler')

var userHandle = function(app) {
    // Get Current User's balance
    app.get('/api/user/:userid/balance', function(req, res) {
		var userid = req.params.userid;
		userController.getUserBalance(res, userid);
    });

    // Get Current User's balance
    app.get('/api/user/login/:signedrequest', function(req, res) {
		userController.login(req.params.signedrequest,function(err, value)
		{
			if (err) errorHandler.send(res, err)
			else
			{
				res.send(value)
			}
		})
    });
}

module.exports = userHandle;