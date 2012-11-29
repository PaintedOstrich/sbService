/*
 *  This Model queues notifications and sends to facebook canvas app
 *  It also follows rules
 */
var redClient = require('../config/redisConfig')()

var base = require('../modelsbase');
var gamesModel = require('./models.gameModel');
var userModel = require('../models/userModel');
var getUserKey = userModel.getUserKey;

var datetime = require('../user_modules/datetime');
var cUtil = require('../user_modules/cUtil');

var NotificationModel = function() {
  this.usersPendingNotifKeys = [
    'usersPendingNotif1',
    'usersPendingNotif2',
  ];

  this.getUserNotifKey = function(uid) {
    return 'user|' + uid + 'notifs';
  }
  // key for data store of user last sent notification
  this.userLastSentNotifKey = 'userLastSentNotifKey';

  // which collection is currently collecting user keys to store pending notification list
  this.currentCollector = this.usersPendingNotifKeys[0];
}

/* switches store from db1 to db2, in essence putting a lock on this data set */
NotificationModel.prototype._switchCollectors = function(){
  this.currentCollector = this.currentCollector == this.usersPendingNotifKeys[0] ? this.usersPendingNotifKeys[1] : this.usersPendingNotifKeys[0];
}

/* get users awaiting notifications and switch databse */
NotificationModel.prototype.getUsersPendingNotification = function(cb){
  try {
    redClient.smembers(this.currentCollector, function(err, userids) {
      this._switchCollectors();
      cb(null, userids);
    })  
  }
  catch(e) {
    cb(e);
  }
}

/* get users awaiting notifications and switch databse */
NotificationModel.prototype.getInfoForUsersPendingNotification = function(cb){
  try {
    
    base.(this.currentCollector, function(err, userids) {
      this._switchCollectors();
      cb(null, userids);
    })  
  }
  catch(e) {
    cb(e);
  }
}

/* Compresses info about a user action as a string for that user in a hashset, string is deliminate by '|' 
 * ActionType : corresponding Creative action
 * fields : wanted info for creatives
 */
NotificationModel.prototype._compressNotification = function(actionType, fields) {
  var compress = 'actionType|' | actionType;
  if (fields && typeof fields !== 'object') {
    console.warn('passing non object as fields to compress:' + fields);
  }
  else {
    for (var name in fields) {
      compress += '_' + name + '|' + fields[name];
    }
  }

  return compress;
}

/* Decompresses info about a user action as a string for that user in a hashset, string is deliminate by '|' 
 * ActionType : corresponding Creative action
 * fields : wanted info for creatives
 * returns decompressed object
 */
NotificationModel.prototype._decompressNotification = function(compressedString) {
  var decompress = {};

  var pairs = compressedString.split('_');

  // iterate through each pair and create object;
  for (var index in pairs) { 
    var pair = pairs[index].split('|'); 
    decompress[pair[0] = pair[1];
  }

  return decompress;
} 

/* Saves info about a user action as a string for that user in a hashset
 * ActionType : corresponding Creative action
 * fields : key|value 'object array' of wanted info for creatives
 */
NotificationModel.prototype.saveNotification = function(uid, actionType, fields, cb) {
  var notifKey = this.getUserNotifKey(uid);

} 








