/**
 * Provide routing for top level pages.
 */

// Render home page.
module.exports.home = function(req, res) {
  res.render('home.ejs');
}

// Render all bet related pages.
module.exports.bet = function(req, res) {
  res.render('bet.ejs');
}

// Used to serve up a 404 not found page.
module.exports.notFound = function(req, res){
  res.status(404).format({
    html: function(){
      res.render('404.ejs');
    },
    json: function(){
      res.send({ message: 'Resource not found' });
    },
    text: function(){
      res.send('Resource not found\n');
    } 
  });
};