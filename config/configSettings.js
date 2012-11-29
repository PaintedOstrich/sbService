/*
 * Config file to load permeable settings
 */

var fs    = require('fs'),
    nconf = require('nconf');

//
// Setup nconf to use (in-order):
//   1. Command-line arguments 
//   2. Environment variables  
//   3. A file located at 'path/to/config.json'
//

var loadSettings = function(baseProjPath) {
  try {
    nconf.argv()
    nconf.env() 
  }
  catch(e) {
    console.log(e)
  }
    
  nconf.add('notifications', { type: 'file', file: baseProjPath +'/notifications/notificationConfig.json' });
  
  // stores everything in in-app memory
  // nconf.use('memory');
}
 
module.exports = loadSettings;
