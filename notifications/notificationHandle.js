/* Notification system for Facebook
 * enqueues notifications, processes, and templatizes highest priority notifications, which it sends to users
 *

DETAILS:::

The notification system works as follows:

Every time an event happens which we want to log, we save the associated info that will be in the notification list. 
This also places the user in a queue which will be evaluated every 30 mintues.

When the queue is evaluated, each user will be notified if they have not received a notification in the last X minutes.
Otherwise they remain in the queue to be notified once we allow them to receive another notification (at that point they have not received another event within the allocated time)

When sending a user notification, we look for the highest priority event, and then sum the total number of occurences of the event for the user.  we then create and send that notification to the user, randomly selecting a creative from one of the matching creative types.  We then clear the user's list of pending notifications, and remove them from the queue.

The priorities and creatives are all currently stored in a config file which is autoloaded when the app starts.  This will be eventually switched over to a {TODO} redis db, so it can be changed on the fly in production.  When saving a user event, we check that the required fields are saved in the event, otherwise we issue a warning in the console.  

There should always be one creative per type that does not require additional parameters in case a change is made on the back end and suddenly these fields are not available.

{TODO} users entering the app on their own should get their notifications by some flag or shown upon landing, and then their pending status and notifications removed from the queue

{TODO} the client should should be able to receive an extension /link or #link with parameters to show these notifications upon landing in the app

*/
var util = require('util')

// logging
var mixpanel = require('../config/mixPanelConfig');

var NotifProcessController = require('./notificationProcessController');
var notifProcessController = new NotifProcessController();
var NotifQueue = require('./notificationQueueModel');
var notifQueue = new NotifQueue();

module.exports = {
  /*
   *  Attach this to a job to call every so often
   *  A user will not receive two notifications within the given config value minTimeBetweenNotifications
   *  
   */
  send : function(){
    notifProcessController.sendNotifications( function(err, logInfo) {
      logInfo && mixpanel.trackSentNotification(logInfo);
    });
  },

  /*
   * Params: (uid, actionType, fields)
   *               'from config file', fields is object with key/values
   */
  queue : function(id, actionType, fields){
    notifQueue.queueNotification(id, actionType, fields);
  }
}
