/*
 * Tests FB Notification System
 */

var vows = require('vows');
var queueSuite = vows.describe('fb_notifcations_test');
var fbSendSuite = vows.describe('fb_notifcations_test');

var util = require('util')
var assert = require('assert')

// load nconf file
require('../../config/configSettings');

// initialize notifications 
var options = {
  access_token : '462000917156397|FFd81qrBClJ6D-nWKZ9v8sFZDc0'
}
var Notifications = require('../notificationPostController');
var notif = new Notifications(options);

var authedFBUser = '100002980043079';
var unauthedFBUser = '10000';
var parkerAuthFBUser = '737835647';

var notificationQueueController = require('../notificationQueueController')();
console.log(notificationQueueController);
/* Test that queuing system works properly */
queueSuite.addBatch({
  'send notifcation to unauthed user': {
    topic: function() {/* Do something async */
      var template = 'you received a notification from Swagger bets';
       notif.sendNotification(unauthedFBUser, template, this.callback )
    },
     'No error in actual request posting': function (error, data) {
        assert.isNull(error)
    },
  }
})

queueSuite.run();

/* Test proper downloading and processing of game info */
fbSendSuite.addBatch({
   'send notifcation to unauthed user': {
      topic: function() {/* Do something async */
        var template = 'you received a notification from Swagger bets';
         notif.sendNotification(unauthedFBUser, template, this.callback )
      },
       'No error in actual request posting': function (error, data) {
          assert.isNull(error)
      },
      'Error message received in response since unauthed user': function(error, data)
      {
        // oauth message code
          assert.notStrictEqual(data.code, 200);
      }
    },
   'send notifcation to authed user': {
      topic: function() {/* Do something async */
        var template = 'you received a notification from Swagger bets';
         notif.sendNotification(authedFBUser, template, this.callback )
      },
       'No error in actual request posting': function (error, data) {
          assert.isNull(error)
      },
      'Success Message Received': function(error, data)
      {
          assert.isTrue(data.success);
      }
    },
   'include another user in a notification': {
      topic: function() {/* Do something async */
        var template = '@['+parkerAuthFBUser +'] notification from Swagger bets';
         notif.sendNotification(authedFBUser, template, this.callback )
      },
       'User should get request': function (error, data) {
          assert.isTrue(data.success);
      },
    },
     'include an unauthed user in a notification': {
      topic: function() {/* Do something async */
        var template = '@['+unauthedFBUser +'] notification from Swagger bets';
         notif.sendNotification(authedFBUser, template, this.callback )
      },
       'User should not be able to send request': function (error, data) {
          assert.notStrictEqual(data.code, 200);
      },
    },
})

// fbSendSuite.run();