/**
 * Contains the middleware to set page local variables. (Variables created and
 * available to each new page rendering)
 */

module.exports = function(req, res, next) {
  res.locals.host = req.headers['host'];
  res.locals.scheme = req.headers['x-forwarded-proto'] || 'http';
  res.locals.url = function(path) {
    return res.locals.scheme + res.locals.url_no_scheme(path);
  };
  res.locals.url_no_scheme = function(path) {
    return '://' + req.headers['host'] + path;
  };
  next();
}
