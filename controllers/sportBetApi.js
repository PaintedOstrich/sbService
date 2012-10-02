//http://api.pickmonitor.com/lines.php?uid=15042&key=36e93

// Usage : s.getBetInfo(s.base)
var querystring = require('querystring');
var ut = require('../controllers/customUtil.js');
var restler = require('restler');

var getBetInfo = function(betObj, cb)
{
	var request = restler.get(betObj.getUrl());

    request.on('fail', function(data) {
      var result = JSON.parse(data);
      console.log('invalid code: ' + result.error.message);
      cb();
    });

    request.on('success', function(data) {
      cb(data);
    });
}

var sportBetApi = {
	sportType : 'generic',

	basePath: "http://api.pickmonitor.com/lines.php?",
	credentials:
	{
		uid: "15042",
		key: "36e93",
	},
	getUrl : function () {
		var url= this.basePath+querystring.stringify(this.credentials);
		if (ut.numberOfElements(this.params)>0)
		{
			url += '&' + querystring.stringify(this.params);
		}

		return url;
	},
};

var NFLSportBet = Object.create(sportBetApi);
NFLSportBet.params =
{
	sports:"football-NFL"
}

module.exports.base = sportBetApi;
module.exports.nfl = NFLSportBet;
module.exports.getBetInfo = getBetInfo;
// footballSportBet.options=