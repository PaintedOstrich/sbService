/*
 * RedisBetModelTest
 * Tests basic operations on key value store in redis bet RedisBetModelTest
 * 
 * To Run:  node tests/betsTest
 */

 var vows = require('vows'),
 	 assert = require('assert');

// server requirements

var BetController = require('../controllers/BetController');

var BetModel = require('../models/BetModel');

var sportBetApi = require('../controllers/sportBetApi');

var ut = require('../customUtil');

var obj={
	getUrl: function(){
		return "http://api.pickmonitor.com/example2.xml";	
	} 
}

var result;
vows.describe('Test Bet Example API').addBatch({
    'test that this returns an xml response and converts to json object': {
        topic: sportBetApi.getBetInfo(obj, function(data){
        	
        	if(!typeof data === "Object")
        	{
        		console.log(data)
        		assert.ok(false,"no data returned from api");
        	}
        	else
        	{
        		console.log(ut.numberOfElements(data["lines"]["game"]));
        		assert.equal(util.numberOfElements(data["lines"]["game"],34); 
        		// console.log(data["lines"]);
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
                // assert.notEqual(typeof result, "undefined");
            }
        }
    }
}).run();


vows.describe('Parsing Data').addBatch({
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

vows.describe('Putting Results Into Database').addBatch({
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
