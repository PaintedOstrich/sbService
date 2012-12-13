/*
 * These are utility classes to help sort through mongo
 *     and return better formatted data
 *
 */
var mongoUtil = {};


/* trims a number to 2 decimal places */
mongoUtil.trimToTwoDecimalPlaces = function(num) {
  return num.toFixed(2);
}

/*
 *  Retrieves a value (or values) from an array of objects 
 *  aggregates all  unique values in an array
 *  
 * to reduce the time complexity instead of calling indexOf on the array, we will make two passes
 *  We mimic a set here by two passes over objects.  the first will be create an object,
 *   and the second will use the object's keys to create the set as an array
 *   Time Complexity O(2 * objs.length * numkeys)
 */
mongoUtil.aggregateValuesFromObjects = function(objs, keys) {
  if (!objs || !objs.length || typeof objs != 'object') {
    return;
  }

  // if we only want one value, make this flexible 
  // so it also works with multiple values
  if (typeof keys === 'string'){
    keys = [keys];
  }

  var values = [];
  var set = {}
  for (var i = 0; i < objs.length; i++) {
    for (var index in keys){
      // this will get rid of duplicates by setting an object's properties
      set[objs[i][keys[index]]] = true;
    }
  }

  // this will put these new object keys in the set
  for (var key in set) {
    values.push(key);
  }

  return values;
}

/*
 * Finds a value in a list of objects
 *  
 * For example, we might look for 'name' given 'uid',  
 *  and they would be in an object in the list that looks like:
 *  [{ uid:'123', name:'frank'}
 *
 * We can also specify a default value
 *
 *  in the above example, our query would be ('name', 'uid', '123', list, 'defaultName')
 */
mongoUtil.getValuePairInList = function(desiredKey, pairKey, pairValue, list, defaultValue) {
  if (!list || !list.length || typeof list != 'object') {
    return defaultValue;
  }

  for (var i = 0; i < list.length; i++) {
    if (list[i][pairKey] == pairValue){
      // return the value of the key in the matching object
      // defaults to defaultValue if null which defaults to null if also not defined
      return list[i][desiredKey] || defaultValue;
    }
  }

  return defaultValue;
}

 module.exports = mongoUtil





