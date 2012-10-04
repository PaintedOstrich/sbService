
var sportBetApi = require('../sportBetApi')(app);

// cron job to run function to update bets every x minutes
var startCron = function(app){
	var cronJob = require('cron').CronJob;
	var getBetInfoJob = new cronJob('1 * * * * *', function(){
    	console.log('You will see this message every 1 minute');
	}, null, true, "America/Los_Angeles")

	getBetInfoJob.start();

};




// load module
module.exports = startCron;