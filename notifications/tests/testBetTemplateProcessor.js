
/* 
 * Tests queue processes for notification
 */

var vows = require('vows');
var suite = vows.describe('notif_queue_test');

var util = require('util')
var assert = require('assert')

var nock = require('nock')

suite.addBatch({
  'test that process controller returns most significant updates': {
    topic: function() {
        return notificationProcessController.getHighestPriorityUpdate(mockUserNotifResult);
      },      
     'Notifications Processed Correctly': function (actualHighestPriorities) {
        assert.deepEqual(actualHighestPriorities, highestPriorities)
    },
  }
});

suite.run();