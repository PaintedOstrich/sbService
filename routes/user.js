/*
 * User routing
 */
 var url = require('url');
 var util = require('util')

 var userController = require('../controllers/user')

var userHandle = function(app) {
    // Get Current User's balance
    app.get('/api/user/:userid/balance', function(req, res) {
		var userid = req.params.userid;
		userController.getUserBalance(res, userid);
    });
}

module.exports = userHandle;