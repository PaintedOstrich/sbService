/* 
 *  This is a local encapuslation of absolute time
 *  
 *  This also enables the toString to be in local time if desired
 */
var time = require('time');
time.tzset('America/New_York');

var timeConverter = {};

timeConverter.convertToSecondsFromTimeString = function(timeString) {
    var t = new time.Date(timeString);
    return t.getTime();
}

/*
 * Creates a date from an unspecified string and casts it into a comparable date object
 *     ex. input  =  '2012-12-23 20:30:00';
 */
timeConverter.convertToDate = function(timeString) {
    var t = new Date(new time.Date(timeString));
    return t;
}

// returns a string of local time.  can pass date or number/string
// (this should be ran in client code, not on server)*********
timeConverter.getLocaleTime = function(t) {
    if (t instanceof Date){
        // already a date
        return t.getLocaleTime();
    }
    else {
        // string or number
        // use main date function which will be set with local time
        t = new Date(t);
        return t.toString();
    }
}

/*
 * Returns now in Seconds in America/New York time
 */
timeConverter.getNowInSeconds = function() {
    var t = new time.Date();
    return t.getTime(); 
}

module.exports = timeConverter;
