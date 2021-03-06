var createErrorMessage = function(err)
{
	var appres = {};
	appres.error = err;
	return appres;
}

var createSuccessMessage = function(suc)
{
	var appres = {};
	appres.success = typeof suc !== "undefined" ? suc : true;
	return appres;
}
var createDataMessage = function(data)
{
	var appres = {};
	appres.data = typeof data !== "undefined" ? data : "";
	return appres;
}


module.exports = 
{
	createSuccessMessage: createSuccessMessage,
	createErrorMessage: createErrorMessage,
	createDataMessage: createDataMessage,
}