/*    NOTIFICATION QUEUING SYSTEM
 *
 *    Queue structure
 *          a list of userids who have pending notifications
 *              iterate through list every 15 minutes, and popping off each user id as we go.
 *                    get all user pending notifications from hash set
 *                    if:  user has not been sent notification in last X minutes
 *                          send highest order notifications, and remove all others
 *                    else: if user has been sent recent notification, push key back on list
 *
 */   

/*
 *  Sends notifcations if they have not already been sent
 */ 

var util = require('util')
var nconf = require('nconf')

console.log('notif Settings ' +util.inspect(notifSettings, true, 3));

var NotificationQueue = function(){
  this.creative = nconf.get('creative');

  var queueConfig = nconf.get('notifQueueConfig');

  // user will not receive two notifications within this time
  this.minTimeBetweenNotifications = queueConfig.minTimeBetweenNotifications || 4*60;
}

// var NotificationQueue.prototype.get






module.exports = NotificationQueue;