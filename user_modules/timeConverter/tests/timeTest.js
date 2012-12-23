var time = require('time');
var vows = require('vows');
var suite = vows.describe('time test');
var assert = require('assert');
var util = require('util');

time.tzset('America/New_York');

var wantedEasternTime = '2012-12-23 20:30:00';

// grand meridian time
var gmtTime = 'Mon, 24 Dec 2012 04:30:00 GMT';
// getTime of gmtTime
var timeSinceBeg = 1356323400000;

var timeConverter = require('../timeConverter');

/* Test that we can read in a date properly and set this accordingly */
suite.addBatch({
 'setup time string from date': {
    topic: function() {/* Do something async */
       return timeConverter.convertToSecondsFromTimeString(wantedEasternTime);
    },
    'game time should be 5 hours less than gmtTime of game': function(gameTimeInSec)
    {
        // console.log('should be ' + gmtTime);
        // console.log('is actually ' + gameTime);

        //subtract 5 hours to equal current time eastern time
        var compareTime = timeSinceBeg - 1000*60*60*3; 
        assert.equal(gameTimeInSec, compareTime);
    },
  },
  'convert to Date and compare': {
    topic: function () {
      return timeConverter.convertToDate(wantedEasternTime)
    },
    'date from local time should equal absolute time': function (gameDate) {
      var actualDate = new Date(gmtTime);

      assert.notDeepEqual(actualDate, gameDate);
    }
  }
})

suite.run();