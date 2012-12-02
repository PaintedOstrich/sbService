/*
 *   Redis Mock.  
 *   Initialized with a dictionary of [key].response
 */ 


// allows us to set varying fields for smembers 
var RedClientMock = function(keysToResponses){
  this.keysToResponses = keysToResponses
};

RedClientMock.prototype.smembers = function(key, cb) {
  cb(null, this.keysToResponses[key])
}

// create new mock object 
var init = function(keysToResponses) {
  return new RedClientMock(keysToResponses);
}

module.exports = init;
