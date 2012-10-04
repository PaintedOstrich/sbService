/*
 * BetController.js
 */

var redis = require('redis')

var redPort = process.env.REDIS_PORT || 6379;
var redUri = process.env.REDIS_URI || '127.0.0.1';

var redClient = redis.createClient(redPort, redUri);

redClient.on('error', function (err) {
    console.log('Error' + err);
});

var rkvStore = [];

rkvStore.set = function(key, value){
  redClient.set(key, value, redis.print);
}

rkvStore.get = function(key, cb){
  redClient.get(key, function(err, value) {
    if (err) throw err;
    cb(value);
  });
}

rkvStore.hset = function(setName, key, value) {
  redClient.hset(setName, key, value);
}

rkvStore.hget = function(setName, key, cb) {
  redClient.hget(setName, key, function(err, value) {
    if (err) throw err;
    cb(value);
  });
}

rkvStore.getAllHashKeys = function(setName, cb) {
  redClient.hkeys(setName, function(err, keys) {
    if (err) throw err;
    keys.forEach(function(key, i) {
      cb(key);
    });
  });
}

module.exports.RKV = rkvStore;