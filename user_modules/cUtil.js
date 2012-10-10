var getNumElements = function(obj){
	var count = 0;
	for (k in obj) if (obj.hasOwnProperty(k)) count++;
	return count;
}
exports.getNumElements = getNumElements;