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

module.exports = 
{
	send: sendError,
	errorCodes: errorCodes,
}




