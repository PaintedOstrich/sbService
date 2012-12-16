
/*
 * Ad Controller
 */

 var util = require('util')
 
 var userController = require('./userController');
 var mixpanel = require('../config/mixPanelConfig');
  
var AdController = function(){
  this.adWatchedReward = 0.10;
}

// give user higher balance for watching an ad.
AdController.prototype.adWatched = function(uid, cb) {
  userController.updateUserBalance(uid, this.adWatchedReward, cb);
}

var adController = new AdController();

module.exports = adController;