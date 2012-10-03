if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === needle) {
                return i;
            }
        }
        return -1;
    };
}

var numberOfElements = function(obj){
	var count = 0;
	for (k in obj) if (obj.hasOwnProperty(k)) count++;
	return count;
}
exports.numberOfElements = numberOfElements;