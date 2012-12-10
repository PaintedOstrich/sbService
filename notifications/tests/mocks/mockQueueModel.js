/* 
 * Tests queue processes for notification
 */

var vows = require('vows');
var queueSuite = vows.describe('notif_queue_test');

var util = require('util')
var assert = require('assert')

var nock = require('nock')

//  Mock Data for Redis

var authedFBUser = '100002980043079';
var unauthedFBUser = '10000';
var parkerAuthFBUser = '737835647';
var oldDate = new Date(-10).toString();
var mockData = {
  usersPendingNotif1 : [authedFBUser],
  usersPendingNotif2 : [parkerAuthFBUser],
  'user|100002980043079|notifs' : ['actionType|wonBet_user|737835647_amount|0.30','actionType|wonBet_user|737835647_amount|0.90'],
  'user|100002980043079|lastnotif': oldDate,
}

var allNotifications = {
  authedFBUser : ['actionType|wonBet_user|737835647_amount|0.30','actionType|wonBet_user|737835647_amount|0.90']
}

var lastUpdate = {
  authedFBUser : oldDate
}

var queueModelMock = function() {

}
  
queueModelMock.getAllNotifications = function(cb) {
    console.log('called')
    cb(null, allNotifications);

  }
queueModelMock.getLastUserUpdates = function(uids, cb) { 
    cb(null, oldDate)
  }

queueModelMock.updateNotificationQueueAfterRequestsSent = function(notified, notNotified){
    cb(null, 'ok')
  }


module.exports = queueModelMock;