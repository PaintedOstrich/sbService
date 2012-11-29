/*
 *  NotificationPostController handles communication with the Facebook NotificationPostController API
 *  It forms the request and sends it to facebook
 */

var querystring = require('querystring');
var https = require('https');
var util = require('util')

var NotificationPostController = function(options){
  if (typeof options !== "object") {
    // warn that options passed in wrong format
    if (options) {console.warn('must init NotificationPostController with options object')};
    
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
NotificationPostController.prototype.sendNotification = function(uid, template, creativeRef, hrefTag, cb) {
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
  fields.ref = creativeRef;
    
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
      
/* 
 *  Init function to make this a global singleton and retain state
 */  
 var notifPostController;

 var createPostController = function(){
    if (notifPostController){
      return notifPostController;
    }
    else {
      return notifPostController = new NotificationPostController();
    }
 }
module.exports = createPostController;
