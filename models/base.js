
// BaseModel for redis to accomplish bulk tasks
var cUtil = require('../user_modules/cUtil');

var redClient = require('../config/redisConfig')()

// iterates through a number of object properties and sets them
var setMultiHashSetItems = function(hkey, namesAndValues, cb)
{
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
// fields is an array
var getMultiHashSets = function(hkeys, fields, cb)
{
	// add is array exception handler for these fields

	var getFields = true;
    if (typeof fields == 'function') {
     	cb = fields;
     	getFields = false;
    }

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

		if (getFields)
		{
			redClient.hmget(id, fields, function(err, values)
			{
				if (err) cb(err);
			
				// add items as object in array
				allValues[finishedCount] = {};
				
				for (var i = 0; i < fields.length; i++)
				{
					if(values[i]) allValues[finishedCount][fields[i]] = values[i];
				}

				// check if entry was null for all values, if so remove and adjust finished and total count, so that it will be overwritten
				finishedCount++;
				if (finishedCount == totalCount)
				{	
					cb(null, allValues)
				}
			});			
		}
		else
		{
			// get all values
			redClient.hgetall(id, function(err, values)
			{
				if (err) cb(err);
				if (values)
				{
					allValues[finishedCount] = values;
					finishedCount++;
				}
				else
				{
					totalCount--;
				}

				if (finishedCount == totalCount)
				{	
					cb(null, allValues)
				}
			});
		}	
	}
}

/* iterate through a list of hash keys and get all values for each
 * rather than returning an array, returns an object with id properties for each value
 * @params: fields = array of fields
 * usage: getMultiHashSetsAsObject(keys, hashFn, fields, cb) 
 *		all Fields: getMultiHashSetsAsObject(keys, hashFn, cb) 
 *
 *	returns: 
 		data
 		{
			id:
			{
				fields...
			},
			...
 		}
 */
var getMultiHashSetsAsObject = function(keys, getHashKeyFromKey, fields, cb)
{
	var getFields = true;
    if (typeof fields == 'function') {
     	cb = fields;
     	getFields = false;
    }

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
		if(getFields)
		{
			redClient.hmget(hkey, fields, function(id)
			{
				// pass callback using closure to key unique betid in scope per call
				return function(err, values)
				{
					if (err) cb(err);
					finishedCount++;
					
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
		else
		{
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
}

// gets all members of multiple sets
var getMembersOfMultipleSets = function(keys, getHashKeyFromKey, cb) {
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

		redClient.smembers(hkey, function(id)
		{
			// pass callback using closure to key unique betid in scope per call
			return function(err, members)
			{
				if (err) cb(err);
				finishedCount++;

				allValues[id] = members;
				if (finishedCount == totalCount)
				{	
					cb(null, allValues)
				}
			};
		}(id));
	}
}

// gets multiple values for the hash function and returns
var getMultiKeyValueAsObject = function(keys, getHashKeyFromKey, cb) {
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

		redClient.get(hkey, function(id)
		{
			// pass callback using closure to key unique betid in scope per call
			return function(err, value)
			{
				if (err) cb(err);
				finishedCount++;

				allValues[id] = value;
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
	getMultiHashSetsAsObject : getMultiHashSetsAsObject,
	getMultiHashSets : getMultiHashSets, 
	setMultiHashSetItems : setMultiHashSetItems,
	getMembersOfMultipleSets : getMembersOfMultipleSets, 
	getMultiKeyValueAsObject : getMultiKeyValueAsObject
}