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

// var dates = []; //<-- Contains a list of dates for the coming week 
// var baseUrl = "http://www.someserver.com";
// var storedChannels = [1,2,3,4,5,6,7,8,9,10,45,23,56,34,23,67,23,567,234,67,345,465,67,34];

// function ProcessNext(betInfo, currentUser, callUsers, cb) {
//     if (currentUser < )
//         d=0;
//         if (ch < storedChannels.length) {
//             ch++;
//         } else {
//             return;
//         }
//     }

//     var channel = storedChannels[ch];
//     var currentDate = dates[d];
//     ajax({    
//         url: baseUrl+"?ch="+channel+"&dt=currentDate"+,
//         complete: function(res) {
//             CMLocalStore.setString('ch' + ch + "_" + scheduleDay, res);
//             ProcessNext(ch, d);
//             },
//     });
// }

// ProcessNext(0, 0);

module.exports = 
{
	getNumElements : getNumElements,
	isOnlyNumber : isOnlyNumber,
}
