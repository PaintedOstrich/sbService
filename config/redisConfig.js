
module.exports = function()
{
	if (process.env.REDISTOGO_URL) {
  		// heroku: redistogo connection
  		var rtg   = require("url").parse(process.env.REDISTOGO_URL);
		var redis = require("redis").createClient(rtg.port, rtg.hostname);

		redis.auth(rtg.auth.split(":")[1]);

		return redis;
	} else {
	  	var redClient = require("redis").createClient();
	  	return redClient;
	}	
}
