/*
 *  This Model queues notifications and sends to facebook canvas app
 *  It also follows rules
 */
var redClient = require('../config/redisConfig')();

var util = require('util')
var base = require('../models/base');
var gamesModel = require('../models/gameModel');

var datetime = require('../user_modules/datetime');
var cUtil = require('../user_modules/cUtil');

var NotificationModel = function() {
  this.usersPendingNotifKeys = [
    'usersPendingNotif1',
    'usersPendingNotif2',
  ];

  // notif list and notif last update keys
  this.getUserNotifsKey = function(uid) {
    return 'user|' + uid + '|notifs';
  }
  this.getLastUserNotifKey = function(uid) {
    return 'user|' + uid + '|lastnotif';
  }
  // key for data store of user last sent notification
  this.userLastSentNotifKey = 'userLastSentNotifKey';

  // which collection is currently collecting user keys to store pending notification list
  this.currentCollector = this.usersPendingNotifKeys[0];
  this.inactiveCollector = this.usersPendingNotifKeys[1];
}

/* gets Info for all users pending notifications */
NotificationModel.prototype.getAllNotifications = function(cb) {
  var that = this;
  var allNotifs = {};
  try {
    that.getUsersPendingNotification(function(err, users) {
      that.getNotificationsForUsers(users, function(err, idsToNotifications) {
        // decompress stored notifications
        for (var grouping in idsToNotifications) {
          allNotifs[grouping] = [];
          var group = idsToNotifications[grouping];

          for (var i = 0; i< group.length; i++) {

           allNotifs[grouping].push(that._decompressNotification(group[i]));
          }
        }

        // call back notifications
        cb(null, allNotifs);
      }) 
    }) 
  }
  catch(e) {
    cb(e);
    console.log(e.stack);
  }
}

/* Gets list of notification ids per user */
NotificationModel.prototype.getNotificationsForUsers = function(uids, cb){
  base.getMembersOfMultipleSets(uids, this.getUserNotifsKey, cb);
}

/* switches store from db1 to db2, in essence putting a lock on this data set */
NotificationModel.prototype._switchCollectors = function(){
  // turn off while testing
  // var inactiveCollector = this.inactiveCollector;
  // var currentCollector = this.currentCollector;

  // this.currentCollector = inactiveCollector;
  // this.inactiveCollector = currentCollector;
}

/* get users awaiting notifications and switch databse */
NotificationModel.prototype.getUsersPendingNotification = function(cb){
  var that = this;
  try {
    redClient.smembers(that.currentCollector, function(err, userids) {
      that._switchCollectors();
      cb(null, userids);
    })  
  }
  catch(e) {
    cb(e);
  }
}

NotificationModel.prototype.addUserToPendingList = function(uid, cb) {
  cb = cb || function(){};
  redClient.sadd(this.currentCollector, uid, cb);
}

/* Compresses info about a user action as a string for that user in a hashset, string is deliminate by '|' 
 * ActionType : corresponding Creative action
 * fields : wanted info for creatives
 */
NotificationModel.prototype._compressNotification = function(actionType, fields) {
  var compress = 'actionType|' +  actionType;
  if (fields && typeof fields !== 'object') {
    console.warn('passing non object as fields to compress:' + fields);
  }
  else {
    for (var name in fields) {
      if(fields[name]) {
        compress += '_' + name + '|' + fields[name];  
      }
      else {
        if (DEVELOPMENT) {
          console.warn(actionType + ' notification field: ' + name + ' is undefined');
        }
      }
      
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
    decompress[pair[0]] = pair[1];
  }

  return decompress;
} 

/* 
 * Queues a notification to be processed on job.
 * Saves info about a user action as a string for that user in a hashset
 * ActionType : corresponding Creative action
 * fields : key|value 'object array' of wanted info for creatives
 */
NotificationModel.prototype.queueNotification = function(uid, actionType, fields) { 
  var notifKey = this.getUserNotifsKey(uid);
  var compressed = this._compressNotification(actionType,fields);
  var that = this;
  try {
    redClient.sadd(notifKey, compressed);
    that.addUserToPendingList(uid);
    console.log('added ' + compressed + ' to   ' + notifKey)  
  }
  catch(e) {
    console.log(e.stack);
  }
} 

/* 
 *set last time user was notified to now and remove pending keys
*/
NotificationModel.prototype.setUsersHaveBeenNotified= function(notifiedMembers) {
  var that = this;
  var now = new Date();
  try {
    for (var index in notifiedMembers) {
      var uid = notifiedMembers[index];
      redClient.set(that.getLastUserNotifKey(uid), now);
      redClient.del(that.getUserNotifsKey(uid));
    }
  }  
  catch(e) {
    console.log(e.stack);
  }
}

/*
 *  Remove all users just notified except those pending
 *       clear locked (inactive) key, and add other user to active set
 */
NotificationModel.prototype.updateNotificationQueueAfterRequestsSent = function(notifiedMembers, membersNotNotified) {
  notifiedMembers = notifiedMembers || [ ];
  membersNotNotified = membersNotNotified || [ ];
  var that = this;
  try {
    // delete set from which most users notified
    redClient.del(that.inactiveCollector);

    // add unnotified users to actives set
    if (membersNotNotified.length) {
      redClient.sadd(that.activeCollector, membersNotNotified);
    }

    // delete pending notification list for each user
    if (notifiedMembers.length){
      that.setUsersHaveBeenNotified(notifiedMembers);  
    }
  }  
  catch(e) {
    console.log(e.stack);
  }
}

/* 
 * gets times as string where last users were notified  
 *  (batch request)
 */
NotificationModel.prototype.getLastUserUpdates = function(listOfUsers, cb) {
  try {
    base.getMultiKeyValueAsObject(listOfUsers, this.getLastUserNotifKey, cb);  
  }
  catch(e){
    console.log(e.stack);
  }
}
  
/* 
 *  Init function to make this a global singleton and retain state
 */  
 var notifModel;

 var createModel = function(){
    if (notifModel){
      return notifModel;
    }
    else {
      return notifModel = new NotificationModel();
    }
 }

module.exports = createModel;








