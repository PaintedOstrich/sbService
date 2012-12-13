/*
 * Handles Access Tokens for a given user
 */

var request = require('request');
var util = require('util')
var redClient = require('../../config/redisConfig')();

var TokenHandler = function(){
  this.tokenKey = 'usertokens';
}

TokenHandler.prototype.saveUserToken = function(uid, token, cb) {
  cb = cb || console.log
  redClient.hset(this.tokenKey, uid, token);
}

TokenHandler.prototype.getUserToken = function(uid, cb) {
  redClient.hget(this.tokenKey, uid, cb);
}

var tokenHandler = new TokenHandler();
module.exports = tokenHandler;


