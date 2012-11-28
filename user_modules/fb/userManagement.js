/* user management of Facebook Ids
 *
 */

var redClient = require('../../config/redisConfig')();

// key for third party id 
var getThirdPartyKey = function(uid)
{
	return "thirdpartykey|" + uid;
}

// Gets the thirdpartyid from cache if present, otherwise requests the id and updates the cache
var getThirdPartyId = function(uid)
{
	// check cache

	// hit facebook  :  Need access token

	// update cache and return string


	// tmp fix
	return uid;
}

// http://graph.facebook.com/dmp?fields=third_party_id
// &access_token=[access_token]

// https://developers.facebook.com/blog/post/431/

module.exports = 
{
	getThirdPartyId: getThirdPartyId,
}