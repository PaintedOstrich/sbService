/*
 *  Wrap MixPanel with custom methods
 *
 */

var cutil = require('../cUtil');
var datetime = require('../datetime')
var redClient = require('../../config/redisConfig')();

var wrapMixPanelWithMethods = function(mixpanel){
  mixpanel.trackMadeBet = function(betInfo) {
    if (!betInfo) {
      return;
    }

    var toSave = {
      'uid': betInfo.initFBId,
      'callee':betInfo.callFBId,
      'gameId':betInfo.gameId,
      'amount':betInfo.betAmount,
      'sport' :betInfo.sport
    }

    mixpanel.track('bet', toSave)
}

  mixpanel.trackCallBet = function(betInfo) { 
    if (!betInfo) {
      return;
    }

    var toSave = {
      'uid': betInfo.callFBId,
      'initBet':betInfo.initFBId,
      'gameId':betInfo.gameId,
      'amount':betInfo.betAmount,
      'sport' :betInfo.sport
    }

    mixpanel.track('call', toSave)
  }

  //gets teh dau key, which is 'dau' +time in 'yyyymmdd'
  var getDAUKey = function(){
    var d = new Date()
    return 'dau'+d.yyyymmdd();
  }

  mixpanel.trackDAU = function(uid) {
    var dauKey = getDAUKey();
    redClient.SISMEMBER(dauKey, uid, function(err, isMember) {
      console.log('is member' + isMember)
      if (!isMember) {
        redClient.SADD(dauKey, uid);
        mixpanel.track('dau', {'uid':uid});
      }
    })
  }

  // track send notification
  mixpanel.trackSentNotification = function(logInfo) { 
    if (!logInfo) {
      return;
    }

    var toSave = {
      'uid': logInfo.uid,
      'creative' : logInfo.creative,
      'action' : 'sent'
    }
     
    mixpanel.track('notification', toSave)
  }

// end wrap mix panel
  return mixpanel;
}


module.exports = wrapMixPanelWithMethods;