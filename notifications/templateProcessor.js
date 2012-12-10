/* 
 * customized template processing for sports bets
*/

var nconf = require('nconf');
var util = require('util')

/* settings */
var creative = nconf.get('creative');

if (!creative) {
  console.warn('Missing Creative Keys in Notifications')
}
else {
  var creativeKeys = creative.creativeKeys;
  var masterTemplates = creative.templates;
  var notificationPriorities = creative.notificationPriority;
}

/* template processor */
var templateProcessor = {};

/*
 * Generates a user notification from user notifs 
 */

templateProcessor.generateNotification = function(userNotifs) {
  try {
    var highestPriorityNotifs = this._getHighestPriorityNotifs(userNotifs);
    var actionType = userNotifs[0].actionType;
    return this._getTemplateForNotification(highestPriorityNotifs, actionType)
  }
  catch(e) {
    console.log('error generating notification : \n' +e.stack)
    return false;
  }
}

/*
 * GETS HIGHEST PRIORITY LIST OF NOTIFICATIONS
 */
templateProcessor._getHighestPriorityNotifs = function(userNotifs){
 var currentHighPriority = -1;
 var  pendingNotifs = [];

    // iterate through lal notifications per user
  for (var itemIndex in userNotifs) {

    var notif = userNotifs[itemIndex];
  
    var priority = this._getPriorityOfNotif(notif);

    if (priority > currentHighPriority) {
      pendingNotifs = [notif];
      currentHighPriority = priority;
    }
    else if (priority == currentHighPriority) {
      pendingNotifs.push(notif);
    }
  }

    // returns single individuals pending user
    return pendingNotifs;
}

/* get the priority of this notification 
 * Notif = notification object
 */
templateProcessor._getPriorityOfNotif = function(notif) {
  var priority = notificationPriorities[notif.actionType];
  if (!priority) {
    priority = 0;
    console.warn(notif.actionType + ' does not have priority value');
  }

  return priority;
}

/*
 * GETS BEST MATCHING TEMPLATE
 * Generates a random creative per matching notification 
 * Checks if count exists, otherwise goes down hierarchy
 *
 * Returns {
      template : 'asdf',
      creativeRef :'creativeID'
    }

    or false if unsuccessful
 */
templateProcessor._getTemplateForNotification = function(bestNotifs, actionType){
  var count = bestNotifs.length;
  var template;
  var templateIndex = Math.min(count, 4); // where to index master template from
  var templatesForAction = masterTemplates[actionType];

  if (!templatesForAction){
    console.warn(actionType + ' has no templates for notifications');
    return false;
  }

  // try all options from most relavent to get a fitting template for actionType
  while(!template) {
    var currTemplateList = templatesForAction[templateIndex];
    while(currTemplateList.length > 0) {
      var rand = Math.floor(Math.random() * currTemplateList.length);
      // randomly get creative from this list
      var currTemplateObj = currTemplateList.splice(rand, 1)[0];
 
      var currTemplate = this.generateSportsTemplate(currTemplateObj.template, bestNotifs);
      if (currTemplate) {
        // we have successfully generatee a tepmlate
        currTemplateObj.template = currTemplate;
        return currTemplateObj
      }
    }

    templateIndex--;

    if(templateIndex == 0) {
      console.warn('error generating template for action type: ' + actionType);
      return false;
    }
  }
   
  // uid, template, creativeRef, hrefTag,
}

 

/* 
 * GENERATE ACTUAL TEMPLATE FROM NOTIFICATION LIST
 */

 // this tries to generate a template, returns falsed if can't...missing matching options, etc.
templateProcessor.generateSportsTemplate = function(template, notifList) {
  var notifKeys = this._createNotifKeys(notifList);
  var template = this._tryReplaceKeys(template, notifKeys);
  return template;
}

templateProcessor._tryReplaceKeys = function(template, notifKeys) {
  if (!template) {
    console.log('not template, continuing...');
    return false;
  }

  for (var index in creativeKeys) {
    while (template.indexOf(creativeKeys[index]) != -1){
      // remove @ from key to creative valid key index in notifKeys
      var replaceKey = creativeKeys[index].slice(1);
      if (!notifKeys[replaceKey]){
        // replace key doesn't exist
        console.warn('missing replace key %s for template: %s', replaceKey, template);
        return false;
      }
      else {
        if(typeof notifKeys[replaceKey] === 'string' || typeof notifKeys[replaceKey] === 'number'){
          // string or number replace
          var replaceItem = notifKeys[replaceKey]; 
        }
        else { 
         var replaceItem = notifKeys[replaceKey].pop();
        }
       
        //dealing with array. make sure has valid item
        if (!replaceItem) {
          // replace item doesn't exist
          console.warn('missing replace key %s for template: %s', replaceKey, template);
          return false;
        }
        else {
          // replace value in template
          if (replaceKey === 'user') {
            notifKeys.count--;
            replaceItem = '{' + replaceItem + '}';
          }

          template = template.replace(creativeKeys[index], replaceItem);
        }
      }
    }
  }

  return template;
}


/*
 *  Aggregates data passed in through notification
 */ 
templateProcessor._createNotifKeys = function(notifList) {
  var notifKeys = {};

  // array of keys to truncate due to precision problems
  var numberKeys = [];

  for (var index in notifList) {
    var notif = notifList[index];

    // iterate through each field in notif List
    for (var key in notif) {
      var value = notif[key];
      if (key === 'user') {
        if (!notifKeys[key]){
          notifKeys[key] = [];
        }

        // add user to list
        notifKeys[key].push(notif[key]);
      }
      else {
       var parsed = parseFloat(value);
       // special way to detect that this is not NaN in javascript
       if (parsed == parsed) {
          // summable field
          if (!notifKeys[key]){
            // init field
            numberKeys.push(key)
            notifKeys[key] = 0.0;
          }

          notifKeys[key] += parsed;
       
        }
        else {
          if (!notifKeys[key]){
            notifKeys[key] = [];
          }

          // add item to list
          notifKeys[key].push(notif[key]);
        }
      }
    }
  }

  // truncate floats due to precision problems
  for (var key in numberKeys) {
    notifKeys[numberKeys[key]] = notifKeys[numberKeys[key]].toFixed(2);
  }

   // set count of notifs
  notifKeys.count = notifList.length;
    
  return notifKeys;
}

module.exports = templateProcessor;
