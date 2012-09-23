/**
 * Give different type of input corresponding size limit to prevent
 * vicious users from sending request with huge body size to cog up the server.
 */
var express = require('express');

var limiters = {
  'application/x-www-form-urlencoded': express.limit('64kb'),
  'application/json': express.limit('32kb'),
  'image': express.limit('2mb')
}
var defaultLimiter = express.limit('32kb');

module.exports = function(req, res, next) {
  var ct = req.headers['content-type'] || '';
  var limiter = limiters[ct] || defaultLimiter;
  limiter(req, res, next);
}
