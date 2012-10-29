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
}

// formats and sends err message
var sendError = function(res, errorCodeObject)
{
	var err = 
	{
		err: errorCodeObject
	}

	res.send(err);
}

module.exports = 
{
	send: sendError,
	errorCodes: errorCodes,
}




