/*
 *  Creates mixpanl object with custom Id and returns it
 *
 */

var util = require('util')
var wrapMixpanel = require('../user_modules/mpWrapper/mixpanelWrapper');

var Mixpanel = require('mixpanel');

// Configure logging to dev or production
var mixpanel = process.env.NODE_ENV == "production" ? Mixpanel.init('01a1b72f289a3c15bbc83c52f3d43da3') : Mixpanel.init('11973125d2a118c43604ea195e1a9d80');	

// wrap mixpanel with custom functions
var mixpanel = wrapMixpanel(mixpanel);

module.exports = mixpanel;



