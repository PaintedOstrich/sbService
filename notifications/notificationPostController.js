/*
 *  This file contains the creatives for notifications, which will ultimately be replaced by a server backed solution
 */

var querystring = require('querystring');
var https = require('https');
var util = require('util')

var Notifications = function(options){
  if (typeof options !== "object") {
    console.log('must init Notifications with options')
    options = {};
  }

  this.request_options = {
    host: 'graph.facebook.com',
    method: 'POST',
    port : 443
  };

  this.params = {
    href :'https://apps.facebook.com/swaggerbetsdev/',
    access_token : options.access_token || process.env.FACEBOOK_APP_ACCESS_TOKEN,
  };

  if(!this.params.access_token) {
    throw new Error("MUST SET FACEBOOK_APP_ACCESS_TOKEN as ENV variable");
  }
}

// href and callback are optional
Notifications.prototype.sendNotification = function(uid, template, hrefTag, cb) {
  if(!uid || !template) {
    throw new Error('must pass uid and template to notifications')
  }

  var fields = this.params;

  if (typeof hrefTag === 'function') {
    cb = hrefTag || function(){}
  } 
  else {
    // append special tag on redirect to be interpreted on client, like #bet:id to show specific bet
    fields.href += hrefTag;
    cb = cb || function(){};
  }
      
  fields.template = template;
    
  // An object of options to indicate where to post to
  var post_options = this.request_options;

  // set specific notification to this user
  post_options.path = '/' + uid +'/notifications?' + querystring.stringify(fields);

  // Set up the request
  var post_req = https.request(post_options, function(res) {
    var data = '';
    res.on('data', function(chunk) {
        data += chunk;
      });
      
      res.on('end', function() {
        
        cb(null, JSON.parse(data));
      });
    }).on('error', function(e) {
      if(process.env.DEBUG) {
        cb("Notif Error: " + e);
      }
  });

  // post the data
  var post_data = 'test';

  post_req.write(post_data);
  post_req.end();
}
      
module.exports = Notifications;
