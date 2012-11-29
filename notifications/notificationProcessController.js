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

var notificationPostController = require('./notificationPostController')();
var notificationPostController = require('./notificationPostController')();

var NotificationProcessController = function(){
  this.creative = nconf.get('creative');
  this.notificationPriority = creative.

  this.notifQueueConfig

  

  // user will not receive two notifications within this time
  this.minTimeBetweenNotifications = queueConfig.minTimeBetweenNotifications || 4*60;
}

var NotificationProcessController.prototype.GetHighestPriorityUpdate = function(){
  
}

/*
 *  Sends notifcations if they have not already been sent
 */ 


/* 
 *  Init function to make this a global singleton and retain state
 */  
 var notifProcessController;

 var createProcessController = function(){
    if (notifProcessController){
      return notifProcessController;
    }
    else {
      return notifProcessController = new NotificationProcessController();
    }
 }




module.exports = createProcessController;