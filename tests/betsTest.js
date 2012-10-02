/*
 * RedisBetModelTest
 * Tests basic operations on key value store in redis bet RedisBetModelTest
 */

 var vows = require('vows'),
 	 assert = require('assert');

// server requirements

var BetController = require('../controllers/BetController');

var BetModel = require('../models/BetModel');

var sportBetApi = require('../controllers/sportBetApi');


 vows.describe('Division by Zero').addBatch({
    'but when dividing zero by zero': {
        topic: function () { return 0 / 0 },

        'we get a value which': {
            'is not a number': function (topic) {
                assert.isNaN (topic);
            },
            'is not equal to itself': function (topic) {
                assert.notEqual (topic, topic);
            }
        }
    }
}).run();

var obj={
	getUrl: function(){
		return "http://api.pickmonitor.com/example2.xml";	
	} 
}
vows.describe('Test Bet Example API').addBatch({
    'test that this returns an xml response': {
        topic: sportBetApi.getBetInfo(obj, function(data){
        	// console.log(data.substring(0,50));
        	if(!data.length > 0)
        	{
        		assert.ok(false,"no data returned from api");
        	}
        	else
        	{
        		assert.equal(data.substring(0,50), '<?xml version="1.0" encoding="ISO-8859-1"?><lines>');
        	}
        }),

        'sportBetApi returns ': function (topic) {
        	// Test Api. assert in callback
        }
    },
    'but when dividing zero by zero': {
        topic: function () { return 0 / 0 },

        'we get a value which': {
            'is not a number': function (topic) {
                assert.isNaN (topic);
            },
            'is not equal to itself': function (topic) {
                assert.notEqual (topic, topic);
            }
        }
    }
}).run();