/*
 *  This module is responsible for handling user management and facebook requests from the server. 
 * 
 *  Module is responsible for handling user auth tokens, and abstracting call information
 *
 *  Handles user login, and communicates with controllers and routing to pass info and errors
 */

var graph = require('fbgraph');
var querystring = require('querystring');
var request = require('request');
var util = require('util');

// other utils
var errorHandler = require('../errorHandler');

// submodules
var verifyFBLogin = require('./verifyFBLogin');

var tokenHandler = require('./tokenHandler');

var Handle = function(options){
  // for testing
  options = options || {}

  this.secret = process.env.FACEBOOK_SECRET || options.FACEBOOK_SECRET
  this.app_token = process.env.FACEBOOK_APP_ACCESS_TOKEN || options.FACEBOOK_APP_ACCESS_TOKEN
  this.app_id = process.env.FACEBOOK_APP_ID || options.FACEBOOK_APP_ID

  if (!this.secret || !this.app_token || !this.app_id) {
    console.warn('FACEBOOK MISSING APP CONFIG');
  }
}
  
Handle.prototype.graphGetWrapper = function(uid, fields, cb) {
  // get user access token from redis
  tokenHandler.getUserToken(uid, function(err, token) {
    if(!token) {
      if (DEVELOPMENT) {
        console.log('unable to make request for ' + uid + ' without token: ');
      }

      // set callback to fields if not set to bubble up error
      cb = cb || fields;
      return cb('no access token')
    }

    // attach access token to call
    graph.setAccessToken(token);

    // proceed with call
    if (typeof fields == 'function') {
      cb = fields;
      graph.get(uid, cb);
    }
    else {
      graph.get(uid, fields, cb);
    }
  })
}

/*
 * Verifies user and gets and saves new longterm access token
 */
Handle.prototype.login = function(shortToken, signedRequest, cb) {
  var data = verifyFBLogin.verify(signedRequest, this.secret);
  if (data) {
    if (!shortToken) {
      return cb(errorHandler.errorCodes.accessTokenRequired)
    }

    var uid = data.user_id;
    // get and save long token
    this.getLongToken(uid, shortToken, function(err, token) {
      if (!err && token){
        tokenHandler.saveUserToken(uid, token);
        cb(null, uid);
      } else {
        cb(errorHandler.errorCodes.invalidAccessToken)
      } 
    });
  }
  else {
    cb(errorHandler.errorCodes.invalidSignedRequest);
  }
}

/*
 * Converts short term client access token into a longer term access token
 * 
 */ 
Handle.prototype.getLongToken = function(uid, shortToken, cb) {
  var base = 'https://graph.facebook.com/oauth/access_token?'
  var params = {
    client_id         : this.app_id,
    client_secret     : this.secret,
    grant_type        : 'fb_exchange_token',
    fb_exchange_token : shortToken
  }            

  var url = base + querystring.stringify(params)
  console.log(url)
  request.proxy = true
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try{
        var fields = body.split(/=|&/);
        cb(null, fields[1]);
      }
      catch(e) {
        cb('err splitting fields')
      }
      
    }
    else {
      cb(body)
    }
  })
}

/*
 *  
 *  Probably won't be called in production, but useful for setup
 */
Handle.prototype.getAppAccessToken = function(uid, shortToken, cb) {
  var base = 'https://graph.facebook.com/oauth/access_token?'
  var params = {
    client_id         : this.app_id,
    client_secret     : this.secret,
    grant_type        : 'client_credentials',
  }            

  var url = base + querystring.stringify(params) 
  request.proxy = true
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      cb(null, body)
    }
    else {
      try {
        var fields = body.split(/=|&/)
        cb(fields[1])
      }
      catch(e){
        console.log('cant parse fb return: ' +e)
      }
    }
  })
}

/*
 *  Gets base user info, with no fields.
 *  This is pretty much whatever the user makes available without extra permissions
 */
Handle.prototype.getBaseUserInfo = function(uid, cb) {
  this.graphGetWrapper(uid, cb);
}



var handle;
var init = function(options) {
  if(!handle) {
    handle = new Handle(options);
  }

  return handle
}
module.exports = init;