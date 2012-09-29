var redis = require('redis'),
    client = redis.createClient(6379, '127.0.0.1');

client.on('error', function (err) {
    console.log('Error' + err);
});

var rkvStore = [];

rkvStore.set = function(key, value){
  client.set(key, value, redis.print);
}

rkvStore.get = function(key, cb){
  client.get(key, function(err, value) {
    if (err) throw err;
    cb(value);
  });
}

rkvStore.hset = function(setName, key, value) {
  client.hset(setName, key, value);
}

rkvStore.hget = function(setName, key, cb) {
  client.hget(setName, key, function(err, value) {
    if (err) throw err;
    cb(value);
  });
}

rkvStore.getAllHashKeys = function(setName, cb) {
  client.hkeys(setName, function(err, keys) {
    if (err) throw err;
    keys.forEach(function(key, i) {
      cb(key);
    });
  });
}

module.exports.RKV = rkvStore;
