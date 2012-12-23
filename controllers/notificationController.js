
var notificationHandle = require('../notifications/notificationHandle');


/* contains custom methods to enqueue certain types of actions */
var notifController = {};

notifController.enqueueBetAccepted = function(toNotifyId, otherUserId, betId){
  var fields = {
    user    : otherUserId,
    '_id'   : betId
  };

  // notificationHandle.queue(toNotifyId, 'betAccepted' , fields);
}

notifController.enqueueBetLoss = function(toNotifyId, otherUserId, betId, teamBetFor){
  var fields = {
    user    : otherUserId,
    '_id'   : betId,
    team    : teamBetFor
  };
  
  notificationHandle.queue(toNotifyId, 'lostBet' , fields);
}

notifController.enqueueBetWon= function(toNotifyId, otherUserId, betId, teamBetFor, amount ){
  var fields = {
    user        : otherUserId,
    '_id'       : betId,
    amount      : amount,
    team        : teamBetFor
  };
  
  notificationHandle.queue(toNotifyId, 'wonBet' , fields);
}

notifController.enqueueBetPrompt = function(toNotifyId, otherUserId, betId, teamToBetFor, amount){
  var fields = {
    user        : otherUserId,
    '_id'       : betId,
    team        : teamToBetFor,
    amount      : amount
  };
  
  notificationHandle.queue(toNotifyId, 'betPrompted' , fields);
}

module.exports = notifController