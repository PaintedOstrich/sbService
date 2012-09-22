/**
 * Render pages/partials related to betting
 */

// List betting categories
module.exports = function(req, res) {
  var category = req.params.category;
  var name = req.params.name;
  
  var str = 'You are requesting a sport under category:' + category;
  if (name) {
    str += (' and the name is:' + name);
  }
  res.send(200, str);
}