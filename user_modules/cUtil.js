var getNumElements = function(obj){
	var count = 0;
	for (k in obj) if (obj.hasOwnProperty(k)) count++;
	return count;
}

var notNumbers = new RegExp("^\\d{1,45}$");

var isOnlyNumber = function(str)
{
    return (notNumbers.test(str))
}
module.exports = 
{
	getNumElements : getNumElements,
	isOnlyNumber : isOnlyNumber,
}
