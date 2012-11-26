var vows = require('vows');
var suite = vows.describe('pickmonapitest');
var util = require('util')
var assert = require('assert')

var nock = require('nock')
  , fs = require('fs')
  , xml2js = require('xml2js')
  , parser = new xml2js.Parser();

var datetime = require('../user_modules/datetime')
var GameModelMock = require('./mocks/gameModelMock');
var gameModelMock = new GameModelMock()
var SandboxedModule = require('sandboxed-module');

// mock dependency injection
var pickApi = SandboxedModule.require('../controllers/pickmonapi', {
    requires : { 
        '../models/game' : gameModelMock,
    }
})

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

var runUpdate = function()
{
    pickApi.updateAllGames(function(err) {
        console.log('done')
    }) 
}

// setupResponse(runUpdate)

/* Test proper downloading and processing of game info */
suite.addBatch({
	 'setup mock objects| ': {
        topic: function() {/* Do something async */
           setupResponse(this.callback)
        },
        'load objects through pickmon api': {
            topic: function() {
                pickApi.updateAllGames(this.callback);
            },
             'I am a vow': function (topic) {
                assert.isTrue(true)
            },
        },
        'is true': function(topic)
        {
            assert.isTrue(true)
        }
    },
})

suite.run();