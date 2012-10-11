
// BaseModel for redis to accomplish bulk tasks
var cUtil = require('../user_modules/cUtil');
var redis = require('redis');
var redis_port = process.env.REDIS_PORT || 6379;
var redis_uri = process.env.REDIS_URI  || '127.0.0.1';
var redClient = redis.createClient(redis_port, redis_uri);


// iterates through a number of object properties and sets them
var setMultiHashSetItems = function(hkey, namesAndValues, cb)
{
	console.log("hkey:" +hkey);
	var finishedCount = 0;
	var totalCount = cUtil.getNumElements(namesAndValues)
	for (var keyName in namesAndValues)
	{
		redClient.hset(hkey, keyName, namesAndValues[keyName], function(err)
		{
			finishedCount++;
			if (err) cb(err);
			if (finishedCount == totalCount)
			{	
				cb()
			}
		});
	}
}

// iterate through a list of hash keys and get all values for each
var getMultiHashSets = function(hkeys, cb)
{
	console.log("hkeys length:" +hkeys.length);
	var finishedCount = 0;
	var totalCount = hkeys.length;
	var allValues = {};
	for (var index in hkeys)
	{
		var id = hkeys[index];
		redClient.hgetall(id, function(id)
		{
			// pass callback using closure to key unique betid in scope per call
			return function(err, values)
			{
				if (err) cb(err);
				finishedCount++;

				allValues[id] = values;
				if (finishedCount == totalCount)
				{	
					cb(null, allValues)
				}
			};
		}(id));
	}
}

module.exports =
{
	getMultiHashSets : getMultiHashSets, 
	setMultiHashSetItems : setMultiHashSetItems
}