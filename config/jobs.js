var cronJob = require('cron').CronJob;

var createJobs = function()
{	
	var job = new cronJob('01 * * * * *', function(){
	    // Check for updates every minute
	    
	  }, function () {
	    // This function is executed when the job stops
	  }, 
	  true /* Start the job right now */,
	  "America/Los_Angeles" /* Time zone of this job. */
	);

	var job = new cronJob('01 01 * * * *', function(){
	    // Do Hourly full updates of info

	  }, function () {
	    // This function is executed when the job stops
	  }, 
	  true /* Start the job right now */,
	  "America/Los_Angeles" /* Time zone of this job. */
	);

}

module.exports = createJobs;