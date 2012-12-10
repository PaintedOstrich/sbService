

var mongoose = require('mongoose');

module.exports = function(doConfigSchema, routePath)
{
  if(process.env.MONGOLAB_URI)
  {
    // server setup
    var uri = process.env.MONGOLAB_URI;
    var db = mongoose.connect(uri);
  }
  else
  {
    // local config
    var db = mongoose.connect('mongodb://localhost/sportsbets'); 
  }

  return mongoose;
}
