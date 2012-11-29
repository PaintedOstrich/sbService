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

var RedClientMock = require('./mocks/redClientQueueMock');

var SandboxedModule = require('sandboxed-module');

// mock dependency injection
var notifQueueModel = SandboxedModule.require('../notificationQueueModel', {
    requires : { 
        '../config/redisConfig' : RedClientMock
    }
})();

var setupResponse = function(cb)
{
    var response;
    fs.readFile('./tests/resources/sampleGameFeed.xml', function(err, data) {
        if (err) {throw new Error('missing input file ' + err) }
        setupMock(data)
        cb()
    });
}

var setupMock = function(response)
{
    mockApiResponse = nock('http://api.pickmonitor.com')
                .get('/lines.php?uid=15042&key=36e93&full_call=1&graded=2&sports=football-NFL')
                .reply(200, response)
}

// compressed string from notif info
var compressed = 'actionType|wonBet_against|12345_amount|0.30';
var decompressed = {
  actionType: 'wonBet',
  against : '12345',
  amount  : '0.30'
}

queueSuite.addBatch({
  'test compression of notif info': {
    topic: function() {
      var notifInfo = {
        actionType: 'wonBet',
        fields : {
          'against' : '12345',
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
      
      var compressed = 'actionType|wonBet_against|12345_amount|0.30';
      return notifQueueModel._decompressNotification(compressed);
    },
     'String decompressed correctly': function (decompress) {
        assert.deepEqual(decompress, decompressed);
    },
  },
  'test get members and switch collectors': {
    topic:function() {
      notifQueueModel.getUsersPendingNotification(this.callback)
    },
    'returns members': function(err, members) {
      assert.deepEqual(['123','234','345'], members)
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