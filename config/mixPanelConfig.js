/*
 *  Creates mixpanl object with custom Id and returns it
 *
 */

var cutil = require('../user_modules/cUtil');

// get unique third party ids per user
var userManagement = require('../user_modules/fb/userManagement');

var Mixpanel = require('mixpanel');

// Configure logging to dev or production
var mixpanel = process.env.NODE_ENV == "production" ? Mixpanel.init('01a1b72f289a3c15bbc83c52f3d43da3') : Mixpanel.init('11973125d2a118c43604ea195e1a9d80');	

// mixpanel.prototype.identifyOnce = function(uid)
// {
// 	uid = userManagement.getThirdPartyId(uid);
// 	mixpanel.distinct_id = uid;
// }

// mixpanel.customTrack = function(data)
// {
// 	data = data.split('|');
// 	if (data.length == 2)
// 	{

// 	}
// }

module.exports = mixpanel;



