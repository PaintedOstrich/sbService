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

/* returns an array of the highest prioirity updates for each user
 * @param: notifs is an array of
  ['userid':  
    [
      {
        actionType: 'wonBet',
        against : '12345',
        amount  : '0.30'
      },
    ]
  ], 
  .... next user
 *
 */


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