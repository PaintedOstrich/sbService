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
var creatives = nconf.get('creative');
var notifQueueConfig = nconf.get('notifQueueConfig');

var  options = {
  creatives :creatives,
  notifQueueConfig : notifQueueConfig
};


var mockQueueModel = require('./mocks/mockQueueModel');
var SandboxedModule = require('sandboxed-module');

// delay loading so config is set
var notifPostController = require('../notificationPostController');

notifProcessController = SandboxedModule.require('../notificationProcessController', {
    requires : { 
        './notificationQueueModel' : mockQueueModel,
        './notificationPostController' : notifPostController
    }
})(options)

console.log(util.inspect(notifProcessController))

queueSuite.addBatch({
  'test whole notification system': {
    topic: function() {
        return notifProcessController.sendNotifications(this.callback);
      },      
     'Notifications Processed Correctly': function (result) {
        console.log('done')
    },
  }
});

// queueSuite.run()
// console.log(util.inspect(notifProcessModel))

// var mockUserNotifResult =  { 
//   '1': [ 
//     {
//       actionType: 'wonBet',
//       against: '12345',
//       amount: '0.30' 
//     },
//     {
//       actionType: 'wonBet',
//       against: '123',
//       amount: '1.30' 
//     }
//   ],
//   '2': [
//     {
//       actionType: 'wonBet',
//       against: '12345',
//       amount: '0.30' 
//     },
//     {
//       actionType: 'lostBet',
//       against: '3483',
//       amount: '1.30' 
//     },
//   ],
//   '3': [],
//   '4': [
//     {
//       actionType: 'lostBet',
//       against: '12345',
//       amount: '0.30' 
//     },
//     {
//       actionType: 'doesNotExist',
//       against: '12345',
//       amount: '0.30' 
//     },
//   ]
// }

// var highestPriorities = { '1': 
//    [ { actionType: 'wonBet', against: '12345', amount: '0.30' },
//      { actionType: 'wonBet', against: '123', amount: '1.30' } ],
//   '2': [ { actionType: 'wonBet', against: '12345', amount: '0.30' } ],
//   '3': [],
//   '4': [ { actionType: 'lostBet', against: '12345', amount: '0.30' } ] };
