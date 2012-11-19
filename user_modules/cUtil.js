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
 * Removes and reformats data into an array
 * Ex. data : {
	
   }
 */




module.exports = 
{
	getNumElements : getNumElements,
	isOnlyNumber : isOnlyNumber,
}
