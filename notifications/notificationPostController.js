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
    href :'https://apps.facebook.com',
    access_token : options.access_token || process.env.FACEBOOK_APP_ACCESS_TOKEN,
  };

  if(!this.params.access_token) {
    // FIXME remove later
    this.params.access_token = '462000917156397|FFd81qrBClJ6D-nWKZ9v8sFZDc0';
    // throw new Error("MUST SET FACEBOOK_APP_ACCESS_TOKEN as ENV variable");
  }
}

// checks that notification fields are present
var hasCorrectParams = function(uid, template, creativeRef) {
  if(!uid || !template || !creativeRef) {
    console.warn('notificationPostController: Param Missing: must pass uid and template and creativeRef to notifications')
    return false;
  }
  else if(typeof uid !== "string" || typeof template !== "string" || typeof creativeRef !== "string") {
    console.warn('notificationPostController: must pass uid and template and creativeRef as strings to notifications');
    return false;
  }

  return true;
}

// href and callback are optional
NotificationPostController.prototype.sendNotification = function(uid, template, creativeRef, hrefTag, cb) {
  if(hasCorrectParams(uid, template, creativeRef))
  {    
    var fields = this.params;

    fields.template = template;
    fields.ref = creativeRef;

    if (typeof hrefTag === 'function') {
      cb = hrefTag || function(){}
    } 
    else {
      // append special tag on redirect to be interpreted on client, like #bet:id to show specific bet
      fields.href = hrefTag;
      cb = cb || function(){};
    }
      
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
  else {
    cb( 'incorrect params')
    console.log('fb notifications post controller: incorrect params');
  }
}
      
/* 
 *  Init function to make this a global singleton and retain state
 */  
 var notifPostController;

 var createPostController = function(options){
    if (notifPostController){
      return notifPostController;
    }
    else {
      return notifPostController = new NotificationPostController(options);
    }
 }
module.exports = createPostController;
