/*
 * Debugs methods of fbHandle
 *
 *  To generate live tokens: goto https://developers.facebook.com/tools/explorer/
 */
var verify = require('../verifyFBLogin');
var Handle = require('../fbHandle');
var tokenHandler = require('../tokenHandler')

var userController = require('../../../controllers/userController')

var options = {
  // development app credentials
  FACEBOOK_APP_ID : '462000917156397',
  FACEBOOK_SECRET : 'c49565e99d6a6b4e1660eb40c5090cfd',
  FACEBOOK_APP_ACCESS_TOKEN : '462000917156397|FFd81qrBClJ6D-nWKZ9v8sFZDc0'
}

var handle = new Handle(options);

/* app set debug value */
DEVELOPMENT = true;

// may need to update these for tests
var accesToken = 'AAAGkLZCiNki0BAKapY4by3EbbL6lTIoMvkMwhL1KDHTKM8LvzTeZBfZBpwsOjt9Gg0zUHPIGY4QIZCPIz8qDIf2kwxx5F5OtAZA88ZBZBY0HQZDZD';

var signedRequest = 'WsLMVDjJH4pGpLPt6l5QUlXXcs0iRekDmnoLU_TNksA.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImNvZGUiOiJBUUNaWGxFMVI5VlM4SXphZVdpVkNCd2t0U25TOS1HUTFMbGljWFNxNlJsTVlQMW9zNUtPRXpFSW96bmpkRWdxM0x6Uk41QUp2X2EyU0NLSVIxckZXdHQ5RHE1M2JGMEJlRlBxVFlWSzhyeER6WXhsY3VJTG1WeGFZOElfV2l4OFQyMWdhRnc0bEhFVXdGcUdZbjVQRmNmMVBjcS1qQlFsd1E3Sy05WkRaRVBrVWZ2VTlxWW9aanNTaHBZNlhTRlBIb0w4cG8wRmZkc3FOQ0VCTWV6QVY1YnUiLCJpc3N1ZWRfYXQiOjEzNTUzNzE5MzIsInVzZXJfaWQiOiI3NTk4Njg5MTcifQ';
var diId = '759868917';

var parkerUID = '737835647';

var badUID = '7737835647';
// var signedRequest = ''
var code = 'AQCZXlE1R9VS8IzaeWiVCBwktSnS9-GQ1LlicXSq6RlMYP1os5KOEzEIoznjdEgq3LzRN5AJv_a2SCKIR1rFWtt9Dq53bF0BeFPqTYVK8rxDzYxlcuILmVxaY8I_Wix8T21gaFw4lHEUwFqGYn5PFcf1Pcq-jBQlwQ7K-9ZDZEPkUfvU9qYoZjsShpY6XSFPHoL8po0FfdsqNCEBMezAV5bu';



// tokenHandler.saveUserToken(badUID, accesToken)
// handle.getLongToken(parkerUID, accesToken, function(err, token) {
//   // set access token to redis
//   tokenHandler.saveUserToken(parkerUID, token)
// })
// handle.login(signedRequest, accesToken, console.log);

// handle.getBaseUserInfo(badUID, console.log);
// console.log(verify.verify(signedRequest, options.FACEBOOK_SECRET))

// handle.login(diId, signedRequest, console.log)

userController.getBaseUserInfo(parkerUID, console.log)
// handle.getAppAccessToken(accesToken, parkerUID, console.log);