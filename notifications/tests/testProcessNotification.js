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

// Mock Notificaton Config
var fs    = require('fs'),
    nconf = require('nconf');   

nconf.add('notifications', { type: 'file', file: __dirname +'/mocks/mockNotificationConfig.json' });
var SandboxedModule = require('sandboxed-module');

// var notifProcessModel = SandboxedModule.require('../notificationProcessController', {
//     // requires : { 
//     //     '../config/redisConfig' : redClientMock,
//     // }
// })()
var notificationProcessController = require('../notificationProcessController')();

var mockUserNotifResult =  { 
  '1': [ 
    {
      actionType: 'wonBet',
      against: '12345',
      amount: '0.30' 
    },
    {
      actionType: 'wonBet',
      against: '123',
      amount: '1.30' 
    }
  ],
  '2': [
    {
      actionType: 'wonBet',
      against: '12345',
      amount: '0.30' 
    },
    {
      actionType: 'lostBet',
      against: '3483',
      amount: '1.30' 
    },
  ],
  '3': [],
  '4': [
    {
      actionType: 'lostBet',
      against: '12345',
      amount: '0.30' 
    },
    {
      actionType: 'doesNotExist',
      against: '12345',
      amount: '0.30' 
    },
  ]
}

var highestPriorities = { '1': 
   [ { actionType: 'wonBet', against: '12345', amount: '0.30' },
     { actionType: 'wonBet', against: '123', amount: '1.30' } ],
  '2': [ { actionType: 'wonBet', against: '12345', amount: '0.30' } ],
  '3': [],
  '4': [ { actionType: 'lostBet', against: '12345', amount: '0.30' } ] };

queueSuite.addBatch({
  'test that process controller returns most significant updates': {
    topic: function() {
        return notificationProcessController.getHighestPriorityUpdate(mockUserNotifResult);
      },      
     'Notifications Processed Correctly': function (actualHighestPriorities) {
        assert.deepEqual(actualHighestPriorities, highestPriorities)
    },
  }
});

queueSuite.run();