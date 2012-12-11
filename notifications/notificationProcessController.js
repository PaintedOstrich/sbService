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

var notificationPostController = require('./notificationPostController')();
var notificationQueueModel = require('./notificationQueueModel')();
var templateProcessor = require('./templateProcessor');

var NotificationProcessController = function(options){
  options = options || {};

  // user will not receive two notifications within this time
  this.minTimeBetweenNotifications = options.minTimeBetweenNotifications || 4*60;
}

/*
 *  Sends notifcations if they have not already been sent
 */ 
NotificationProcessController.prototype.sendNotifications = function(cb) {
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
        var lastUpdate = new Date(lastUpdateTimes[id]);

        if (!lastUpdateTimes[id] || lastUpdate.isXMinutesBeforeNow(this.minTimeBetweenNotifications)){
          // add user to sending list
          notified.push(id);

          var notifToSend = templateProcessor.generateNotification(idsToNotifications[id]);
          if (notifToSend) {
            // notificationPostController.sendNotification(id, notifToSend.template, notifToSend.creativeRef, hrefTag, function(err, success) {
              // FIXME Add href tag
            if (DEVELOPMENT) {
              console.log('sending notification to ' + id + ' with creative : ' + notifToSend.creativeRef + '\n' + notifToSend.template);
            }
            notificationPostController.sendNotification(id, notifToSend.template, notifToSend.creativeRef, function(err, success) {
              if (err) {
                console.log(err);
              }
            })
          }
        }
        else {
          // user should wait to be notified
          if (DEVELOPMENT){
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