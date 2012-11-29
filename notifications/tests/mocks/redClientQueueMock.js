
var RedClientMock = function(){
   this.members = ['123','234','345'];
};

RedClientMock.prototype.smembers = function(uid, cb) {

  cb(null, this.members)
}

// create new mock object
var initClient = function() {
  return new RedClientMock()
}

module.exports = initClient;