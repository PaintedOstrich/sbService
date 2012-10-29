
// BaseModel for redis to accomplish bulk tasks
var cUtil = require('../user_modules/cUtil');

var redClient = require('../config/redisConfig')()

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

	// if no keys, return
	if (totalCount == 0)
	{
		cb();
	}
	var allValues = [];
	for (var index in hkeys)
	{
		var id = hkeys[index];
		redClient.hgetall(id, function(err, values)
		{
			if (err) cb(err);
			allValues[finishedCount] = values;
			finishedCount++;

			if (finishedCount == totalCount)
			{	
				cb(null, allValues)
			}
		});
	}
}

// FIXME NEED TO CONSOLIDATE BOTTOM METHODS

// iterate through a list of hash keys and get all values for each
// rather than returning an array, returns an object with id properties for each value
var getMultiHashSetsAsObject = function(keys, getHashKeyFromKey, cb)
{
	var finishedCount = 0;
	var totalCount = keys.length;

	// if no keys, return
	if (totalCount == 0)
	{
		cb();
	}

	var allValues = {};
	for (var index in keys)
	{
		var id = keys[index];
		var hkey = getHashKeyFromKey(id);
		redClient.hgetall(hkey, function(id)
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

// iterate through a list of hash keys and get all values for each
// rather than returning an array, returns an object with id properties for each value
// may return null values for each field
var getMultiHashSetsAsObjectForFields = function(keys, getHashKeyFromKey, fields, cb)
{
	var finishedCount = 0;
	var totalCount = keys.length;

	// if no keys, return
	if (totalCount == 0)
	{
		cb();
	}

	var allValues = {};
	for (var index in keys)
	{
		var id = keys[index];
		var hkey = getHashKeyFromKey(id);
		redClient.hmget(hkey, fields, function(id)
		{
			// pass callback using closure to key unique betid in scope per call
			return function(err, values)
			{
				if (err) cb(err);
				finishedCount++;
				debugger;
				
				// add items as children of object
				allValues[id] = {};
				for (var i = 0; i < fields.length; i++)
				{
					allValues[id][fields[i]] = values[i];	
				}
				
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
	getMultiHashSetsAsObjectForFields : getMultiHashSetsAsObjectForFields,
	getMultiHashSets : getMultiHashSets, 
	setMultiHashSetItems : setMultiHashSetItems
}