var async = require('async')

/*
 * Gets the number of elements in an object
 */
var getNumElements = function(obj){
	var count = 0;
	for (k in obj) if (obj.hasOwnProperty(k)) count++;
	return count;
}

/* 
 * Sets prop if obj doesn't have the name of this function
 */ 
var set = function(obj, name, fun)
{
	if (obj.hasOwnProperty(name))
	{
		obj.name = fun;
	}
	else
	{
		console.log("Object Already has this propery");
	}		
}

/*
 * Checks that an contains letters
 */
var notNumbers = new RegExp("^\\d{1,45}$");
var isOnlyNumber = function(str)
{
    return (notNumbers.test(str))
}

/*
 * Process an array sequentially and asynchronously
 * Waits for callback from one array entry to process next
 */
var processSeriesAsync = function(list, func, cb) {
	if (DEVELOPMENT){
		// console.log('processing ' + list.length + ' items async');
	}
	if (typeof list !== 'object'){
		console.log('processSeriesAsync must be passed arraylist')
		return false;
	}

	var totalCount = list.length;
	// if no keys, return
	if (totalCount == 0)
	{
		cb();
	}
	else {
		processHelperAsync(list, func, totalCount, 0, cb);	
	}
}

/*
 *  Processes individual items, stopping if an error is found
 */
var processHelperAsync = function(list, func, totalCount, currentIndex, cb) {
	func(list[currentIndex], function(err){
		if (err) {
			console.log('calling back error: '+ err);
			cb(err);
		} 
		else {
			if (currentIndex < totalCount -1){
				currentIndex ++;
				processHelperAsync(list, func, totalCount, currentIndex, cb)
			}
			else {
				cb()
			}
		}
	})
}

/* trims a number to 2 decimal places */
var trimToTwoDecimalPlaces = function(num) {
	console.log('fixing number')
  return num.toFixed(2);
}


module.exports = 
{
	getNumElements : getNumElements,
	isOnlyNumber : isOnlyNumber,
	processSeriesAsync : processSeriesAsync,
	trimToTwoDecimalPlaces : trimToTwoDecimalPlaces,
}
