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
var datetime = require('../user_modules/datetime');
var nconf = require('nconf')
var creative = nconf.get('creative');
var notifQueueConfig = nconf.get('notifQueueConfig');

var notificationPostController = require('./notificationPostController')();
var notificationQueueModel = require('./notificationQueueModel')();
var templateProcessor = require('./templateProcessor');
var notificationPriorities = creative.notificationPriority;
var NotificationProcessController = function(){

  // user will not receive two notifications within this time
  this.minTimeBetweenNotifications = notifQueueConfig.minTimeBetweenNotifications || 4*60;
}

/*
 *  Sends notifcations if they have not already been sent
 */ 
NotificationProcessController.prototype.sendNotifications = function(cb) {
  var that = this;

  notificationQueueModel.getAllNotifications(function(err, idsToNotifications) {
    var uids = [];
    for (var id in idsToNotifications) {
      uids.push(id);
    }

    notificationQueueModel.getLastUserUpdates(uids, function(err, lastUpdateTimes) {
      var notified = [];
      var notNotified = [];
      lastUpdateTimes = lastUpdateTimes || {};

      for (var id in idsToNotifications){
        // check that user should receive update
        var lastUpdate = new Date(parseInt(lastUpdateTimes[id]));

        if (!lastUpdateTimes[id] || lastUpdate.isXMinutesBeforeNow(that.minTimeBetweenNotifications)){
          // add user to sending list
          notified.push(id);

          // get the highest priority notifications
          var highestPriorityNotifs = that._getHighestPriorityNotifs(idsToNotifications[id]);

          var notifToSend = templateProcessor.generateNotification(highestPriorityNotifs);
          if (notifToSend) {

            var hrefTag = that._tryGenerateHrefTag(highestPriorityNotifs);

            if (DEVELOPMENT) {
              console.log('sending notification to ' + id + ' with creative : ' + notifToSend.creativeRef + ' href:' + hrefTag +  '\n' + notifToSend.template);
            }

            var logInfo = {
              uid: id,
              creative: notifToSend.creative
            }
            // send notification, with href if present
            if (hrefTag){
              notificationPostController.sendNotification(id, notifToSend.template, notifToSend.creativeRef, hrefTag, function(err, data){
                if (data.success){

                  cb(null, logInfo)
                }
                else {
                  console.log('error sending notification to '+ id + '\n' + util.inspect(data));
                  cb(data)
                }
              });
            }
            else {
              notificationPostController.sendNotification(id, notifToSend.template, notifToSend.creativeRef,function(err, data){
                 if (data.success){

                  cb(null, logInfo)
                }
                else {
                  console.log('error sending notification to '+ id + '\n' + util.inspect(data));
                  cb(data)
                }
              })
            }
          }
        }
        else {
          // user should wait to be notified
          if (DEVELOPMENT) {
            console.log('not sending user: ' + id + ' notification because recently notified\n ' + lastUpdate);
          }

          notNotified.push(id);
        }
      }

      notificationQueueModel.updateNotificationQueueAfterRequestsSent(notified, notNotified);
    });
  });
}

/*
 * Tries to generate the hrefTag for the notification
 * this will happen if the notif list contains at least 1 _id property, and the actionType has an action for the hrefTag
 */
NotificationProcessController.prototype._tryGenerateHrefTag = function(userNotifs) {
  var listOfIds = [];

  // double check that htis is defined
  if (!userNotifs || !userNotifs.length){
    return;
  }

  var hrefAction = creative.hrefTag[userNotifs[0].actionType];
  if (!hrefAction) {
    console.log('hrefTag is not defined for ' + userNotifs[0].actionType);
    return;
  }

  for (var i = 0; i < userNotifs.length; i++) {
    if (userNotifs[i]._id) {
      listOfIds.push(userNotifs[i]._id);
    }
  }

  var hrefTag = '?' + hrefAction + '=' + listOfIds.toString();
  return hrefTag;
}

/*
 * GETS HIGHEST PRIORITY LIST OF NOTIFICATIONS
 */
NotificationProcessController.prototype._getHighestPriorityNotifs = function(userNotifs){
  var currentHighPriority = -1;
  var  pendingNotifs = [];

  if (!userNotifs || !userNotifs.length)
  {
    return pendingNotifs;
  }

    // iterate through lal notifications per user
  for (var itemIndex in userNotifs) {

    var notif = userNotifs[itemIndex];
  
    var priority = this._getPriorityOfNotif(notif);

    if (priority > currentHighPriority) {
      pendingNotifs = [notif];
      currentHighPriority = priority;
    }
    else if (priority == currentHighPriority) {
      pendingNotifs.push(notif);
    }
  }

    // returns single individuals pending user
    return pendingNotifs;
}

/* get the priority of this notification 
 * Notif = notification object
 */
NotificationProcessController.prototype._getPriorityOfNotif = function(notif) {
  var priority = notificationPriorities[notif.actionType];
  if (!priority) {
    priority = 0;
    console.warn(notif.actionType + ' does not have priority value');
  }

  return priority;
}

/* 
 *  Init function to make this a global singleton and retain state
 */  
 var notifProcessController;

 var createProcessController = function(options){
    if (!notifProcessController){
      notifProcessController = new NotificationProcessController(options);
    }
    
    return notifProcessController;
 }




module.exports = createProcessController;