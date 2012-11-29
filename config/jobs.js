var cronJob = require('cron').CronJob;
var pickmonapi = require('../controllers/pickmonapi')

var createJobs = function()
{	
	var job = new cronJob('01 * * * * *', function(){
	    // Check for updates every minute
	    pickmonapi.checkForUpdates(function(err) {
	    	if (err) {
	    		console.log('error checking update:' + err);
	    	}
	    	else {
	    		console.log('check update complete:success')
	    	}
	    })
	    
	  }, function () {
	    // This function is executed when the job stops
	  }, 
	  true /* Start the job right now */,
	  "America/Los_Angeles" /* Time zone of this job. */
	);

	var job = new cronJob('01 01 * * * *', function(){
	    // Do Hourly full updates of info
	    pickmonapi.updateAllGames(function(err) {
	    	if (err) {
	    		console.log('error updating all games:' + err);
	    	}
	    	else {
	    		console.log('update all games complete:success')
	    	}
	    })
	  }, function () {
	    // This function is executed when the job stops
	  }, 
	  true /* Start the job right now */,
	  "America/Los_Angeles" /* Time zone of this job. */
	);
}

module.exports = createJobs;