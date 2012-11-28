
module.exports = function()
{
	if (process.env.REDISTOGO_URL) {
  		// heroku: redistogo connection
  		var rtg   = require("url").parse(process.env.REDISTOGO_URL);
		var redClient = require("redis").createClient(rtg.port, rtg.hostname);

		redClient.auth(rtg.auth.split(":")[1]);

	} else {
	  	var redClient = require("redis").createClient();
	}	

	// Red Client Throws on an Error.
	// All Client Models should access redis in try/catch block.
	// This helps simplify code and eliminates need to check for errors at every step.
	// redClient.on("error", function(err) {
 //  		throw new Error("Error Connecting to Redis" + err);
	// });

	return redClient;
}

