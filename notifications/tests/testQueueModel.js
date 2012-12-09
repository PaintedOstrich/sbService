/* 
 * Tests queue processes for notification
 */

var vows = require('vows');
var queueSuite = vows.describe('notif_queue_test');

var util = require('util')
var assert = require('assert')

var nock = require('nock')
  // , fs = require('fs')
  // , xml2js = require('xml2js')
  // , parser = new xml2js.Parser();

//  Mock Data for Redis
var date = new Date(-10).toString();
var mockData = {
  usersPendingNotif1 : ['11','22','33'],
  usersPendingNotif2 : ['123','234','345'],
  'user|11|notifs' : ['actionType|wonBet_user|12345_amount|0.30'],
  'user|12|notifs' : ['actionType|wonBet_user|1235_amount|1.50','actionType|wonBet_user|12345_amount|0.30'],
  'user|1|lastnotif': date,
}

var redClientMock = require('./mocks/redClientQueueMock')(mockData);

var SandboxedModule = require('sandboxed-module');

// mock dependency injection
var notifQueueModel = SandboxedModule.require('../notificationQueueModel', {
    requires : { 
        '../config/redisConfig' : redClientMock,
    }
})()

// compressed string from notif info
var compressed = 'actionType|wonBet_user|12345_amount|0.30';

var decompressed = {
  actionType: 'wonBet',
  user : '12345',
  amount  : '0.30'
}

queueSuite.addBatch({
  'test compression of notif info': {
    topic: function() {
      var notifInfo = {
        actionType: 'wonBet',
        fields : {
          'user' : '12345',
          'amount'  : '0.30'
        }
      }
      return notifQueueModel._compressNotification(notifInfo.actionType, notifInfo.fields);
    },
     'String compressed correctly': function (compress) {
        assert.strictEqual(compress, compressed);
    },
  },
  'test decompression of notif info': {
    topic: function() {
      
      var compressed = 'actionType|wonBet_user|12345_amount|0.30';
      return notifQueueModel._decompressNotification(compressed);
    },
     'String decompressed correctly': function (decompress) {
        assert.deepEqual(decompress, decompressed);
    },
  },
  'test get members and switch collectors': {
    topic:function() {
      // reset notification queue so that it gets first results
      notifQueueModel.getUsersPendingNotification(this.callback)
    },
    'returns members': function(err, members) {
      assert.deepEqual([ '11', '22', '33' ], members)
      // test that the current collector changes after this call
      assert.equal(notifQueueModel.usersPendingNotifKeys[1], notifQueueModel.currentCollector)
    }
  },
  'test that queue retains state after reloaded' : {
    topic:function() {
      var oldNotifQueue = require('../notificationQueueModel')();
      oldNotifQueue.currentCollector= notifQueueModel.usersPendingNotifKeys[1];
      var newNotif = require('../notificationQueueModel')();
      return newNotif;
    },
    'queue retains active collector state': function(newNotifQueue) {
      assert.equal(newNotifQueue.currentCollector, newNotifQueue.usersPendingNotifKeys[1]);
      // test that the current collector changes after this call
    }
  },
});

queueSuite.run();