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
  'watchAdCode':
  {
  	// User doesn't have sufficient funds and needs to watch an advertisement
  	reason:'insufficientFunds'
  },
  'gameDoesNotExist':
  {
  	// Game being accessed does not exist
  	reason:'gameDoesNotExist'
  },
  // set debug error different than production error details
  'updateBalanceError':
  {
	reason:'updateBalanceError'
  },	
  // missingParamaters
  'missingParamaters':
  {
  reason:'missingParamaters'
  },  
  // invalid signed fb request
  'invalidSignedRequest':
  {
     reason:'invalidSignedRequest'
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
  'missingParamaters' : {
    reason:'missingParameters'
  },
  'outOfDate' : {
    reason:'outOfDate'
  },
  'insufficientFunds' : {
    reason :'insufficientFunds'
  },
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
		reason: errorCodeObject
	}

	res.send(error);
}

// creates a custom error code
// @params: error == error code object, params = array of values or string
// returns new error code
var createErrorMessage = function(error, params) {
  if (typeof error === 'string')
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




