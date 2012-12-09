
/* 
 * Tests queue processes for notification
 */

var vows = require('vows');
var suite = vows.describe('notif_template_test');

var util = require('util')
var assert = require('assert')

var nock = require('nock')

// Mock Notificaton Config
var fs    = require('fs'),
    nconf = require('nconf');   

nconf.add('notifications', { type: 'file', file: __dirname +'/mocks/mockNotificationConfig.json' });

var templateProcessor = require('../templateProcessor');

var notifList = [
  {
    actionType: 'wonBet',
    user : '123',
    amount  : '0.30'
  },
  {
    actionType: 'wonBet',
    user : '1234',
    amount  : '0.50'
  },
  {
    actionType: 'wonBet',
    user : '12345',
    amount  : '0.40'
  },
];
var lostList = 
[
  {
    actionType: 'lostBet',
    user : '12345',
    amount  : '0.40'
  },
];

var testReplace1 = "Congratulations, you beat @user and @user, and @count to win $@amount";
var testResult1 = "Congratulations, you beat {12345} and {1234}, and 1 to win $1.20";
suite.addBatch({
  'test that aggregation of notifs works correctly': {
    topic: function() {
        return templateProcessor._createNotifKeys(notifList);
      },      
     'Notifications Processed Correctly': function (notifAgg) {
        assert.equal(notifAgg.count, 3);
        assert.equal(notifAgg.amount, 1.20);
        assert.deepEqual(notifAgg.user, ['123','1234','12345']);
      },
      'try and replace different templates': {
        topic: function(notifAgg) {
          return templateProcessor._tryReplaceKeys(testReplace1, notifAgg);
        },      
       'Notifications Processed Correctly': function (newTemplate) {
          assert.equal(testResult1, newTemplate)
      },
    },     
  },
  'test whole templating process' : {
    topic: function() {
      return templateProcessor.generateSportsTemplate(testReplace1, notifList)
    },
    'Notification Processed Correctly' : function(template) {
      assert.equal(testResult1, template)
    }
  },
  'test generate from config file process' : {
    topic: function() {
      return templateProcessor.generateNotification(lostList)
    },
    'Notification Processed Correctly' : function(template) {
      console.log(util.inspect(template))
    }
  }
  
});

suite.run();