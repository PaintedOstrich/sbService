/*
 * User routing
 */
 var url = require('url');
 var util = require('util')

 var adController = require('../controllers/adController');
 var errorHandler = require('../user_modules/errorHandler');


var adHandle = function(app) {
  // Get Current User's balance 
  app.get('/api/ad/watched/:uid', function(req, res) {
  var uid = req.params.uid;
    adController.adWatched(uid, function(err, data) {
      if (err) {
        errorHandler.send(res, err)
      } 
      else {
        res.send({sucess:true});
      }
    });
  });
}

module.exports = adHandle