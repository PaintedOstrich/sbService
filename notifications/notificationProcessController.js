/*    NOTIFICATION QUEUING SYSTEM
 *
 *    Queue structure
 *          a list of userids who have pending notifications
 *              iterate through list every 30 minutes, and popping off each user id as we go.
 *                    get all user pending notifications from hash set
 *                    if:  user has not been sent notification in last X minutes
 *                          send highest order notifications, and remove all others
 *                    else: if user has been sent recent notification, push key back on list
 *
 */   

var util = require('util')
var nconf = require('nconf')


// var notificationPostController = require('./notificationPostController')();

var NotificationProcessController = function(){
  var creatives = nconf.get('creative');
  this.notificationPriorities = creatives.notificationPriority;

  var notifQueueConfig = nconf.get('notifQueueConfig');

  // user will not receive two notifications within this time
  this.minTimeBetweenNotifications = notifQueueConfig.minTimeBetweenNotifications || 4*60;

}

/* returns an array of the highest prioirity updates
 * @param: notifs is an array of
  ['userid':  
    [
      {
        actionType: 'wonBet',
        against : '12345',
        amount  : '0.30'
      }
    ]
  ]
 *
 */
NotificationProcessController.prototype.getHighestPriorityUpdate = function(notifs){
  var pendingNotifs = {};
  // iterate through all users
  for (var userId in notifs) {
    var userNotifs = notifs[userId];

    var currentHighPriority = -1;
    pendingNotifs[userId] = [];

    
    // iterate through lal notifications per user
    for (var itemIndex in userNotifs) {

      var notif = userNotifs[itemIndex];
    
      var priority = this._getPriorityOfNotif(notif);

      if (priority > currentHighPriority) {
        pendingNotifs[userId] = [notif];
        currentHighPriority = priority;
      }
      else if (priority == currentHighPriority) {
        pendingNotifs[userId].push(notif);
      }
    }
  }

  return pendingNotifs;
}

/* get the priority of this notification 
 * Notif = notification object
 */
NotificationProcessController.prototype._getPriorityOfNotif = function(notif) {
  var priority = this.notificationPriorities[notif.actionType];
  if (!priority) {
    priority = 0;
    console.warn(notif.actionType + ' does not have priority value');
  }
  return priority;
}

/* Generates a random creative per matching notification 
 * Checks if count exists, otherwise goes down hierarchy
 * 
 *
 */
NotificationProcessController.prototype.getCreativeForNotification = function(notifs){
  var toSend = [];
  for (var uid in notifs) {
    var notifList = notifs[uid];
    var count = notifList.length;

    if(count >=3) {

    }
    else if (count == 2) {

    }
    else {

    }
  }
 

  uid, template, creativeRef, hrefTag,

}


/*
 *  Generates a creative
 */
NotificationProcessController.prototype.getBestCreative = function(actionType, count){
  while(count != 0) {
    var actionTypeList = creatives[actionType][count];
    if (actionTypeList) {
      var creativeIndex = Math.floor(Math.random() * actionTypeList.length);
      return this.generateCreative()
    }
    count--;
  }
}

/*
 * 
 */
NotificationProcessController.prototype.generateCreative = function(uid, actionType, template, creativeRef, listOfNotifications) {
  if (template.indexOf('@amount') >0) {
    for 
  }
}


/*
 *  Sends notifcations if they have not already been sent
 */ 


/* 
 *  Init function to make this a global singleton and retain state
 */  
 var notifProcessController;

 var createProcessController = function(){
    if (!notifProcessController){
      notifProcessController = new NotificationProcessController();
    }
    
    return notifProcessController;
 }




module.exports = createProcessController;