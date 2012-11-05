
var dbKeys = 
{
	// gets bets for a given user
	getUserBetKey : function(fbid)
	{
		return 'bets|user|' + fbid;
	},
}

module.exports = dbKeys