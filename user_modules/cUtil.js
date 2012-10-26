/*
 * Gets the number of elements in an object
 */
var getNumElements = function(obj){
	var count = 0;
	for (k in obj) if (obj.hasOwnProperty(k)) count++;
	return count;
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
