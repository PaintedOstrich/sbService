/**
Sends an error in the following format
  {
	err: {
	  reason: ''
	}
  }

  usage: sendError(errorCodes.errorName)
*/
var errorCodes =
{
  'gameDoesNotExist':
  {
  	// Game being accessed does not exist
  	reason:'gameDoesNotExist'
  },
  'userAlreadyClaimedFreeBet': {
    // user cannot claim more than one free bet from bet requests
    reason: 'userAlreadyClaimedFreeBet'
  },
  // set debug error different than production error details
  'updateBalanceError':
  {
	reason:'updateBalanceError'
  },	
  // missingParamaters
  'missingParameters':
  {
  reason:'missingParameters'
  },  
  // bet request does not exist
  'betRequestNotExist':
  {
    reason:'betRequestNotExist'
  },
  'cannotBetYourself':
  {
  reason:'cannotBetYourself'
  },  
  // invalid signed fb request
  'invalidSignedRequest':
  {
     reason:'invalidSignedRequest'
  }, 
  // invalidAccessToken passed in login
  'invalidAccessToken':
  {
     reason:'invalidAccessToken'
  }, 
  // invalidAccessToken passed in login
  'invalidAccessToken':
  {
     reason:'invalidAccessToken'
  }, 
  // error accessing graph
  'graphAccessError':
  {
     reason:'graphAccessError'
  }, 
  'betZeroOrNegative':
  {
    reason:'betZeroOrNegative'
  },
  'inproperGameIdKey':
  {
    reason:'inproperGameIdKey'
  },
  'userAlreadyExists' : {
    // trying to create user which already exists
    reason:'userAlreadyExists'
  },
  'userDoesNotExist' : {
    // referencing user which doesn't exist
    reason:'userDoesNotExist'
  },
  'userNotInApp' : {
    // referencing user which doesn't exist
    reason:'userNotInApp',
  },
  'outOfDate' : {
    reason:'outOfDate'
  },
  'pastWagerCutoff': {
    reason:'pastWagerCutoff'
  },
  'insufficientFunds' : {
    reason :'insufficientFunds'
  },
  'betAlreadyCalled' : {
    reason :'betAlreadyCalled'
  },
  'betDoesNotExist' : {
    reason :'betDoesNotExist'
  }
}

// formats and sends err message
var sendError = function(res, errorCodeObject)
{	
  if (!res || !errorCodeObject)
  {
    throw new Error("Send Error Missing Parameters");
  }
	var error = 
	{
      err: errorCodeObject  
	}

	res.send(error);
}

// creates a custom error code
// @params: error == error code object, params = array of values or string
// returns new error code
var createErrorMessage = function(error, params) {
  if (!error || typeof error === 'string')
  {
    throw new Error('createErrorMessage must be passed error object');
  }

 error.data = params;

  return error;
}

module.exports = 
{
  createErrorMessage : createErrorMessage,
	send: sendError,
	errorCodes: errorCodes,
}




