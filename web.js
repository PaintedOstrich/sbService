var async   = require('async');
var express = require('express');
var util    = require('util');
var http = require('http');
var pageLocals = require('./middleware/pageLocals');
var bodyLimiter = require('./middleware/bodyLimiter');
var routes = require('./routes/index');
var betPages = require('./routes/betpages');

// create an express webserver
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.static(__dirname + '/public'));
  app.use(bodyLimiter);
  app.use(express.bodyParser());
  app.use(express.cookieParser('bdae@gkdl{dd}]fbafet;dsfasdfbxcwerd'));
  app.use(express.session({secret: process.env.SESSION_SECRET || 'secret123'}));
  app.use(pageLocals);
  app.use(require('faceplate').middleware({
    app_id: process.env.FACEBOOK_APP_ID,
    secret: process.env.FACEBOOK_SECRET,
    scope:  'user_likes,user_photos,user_photo_video_tags'
  }));
});


var environment = process.env.environment || 'development';
// development only
if (environment == 'development') {
  console.log('In Development mode!');
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
}

// production only
if (environment == 'production') {
  console.log('In Production mode!');
  app.use(express.logger());
}

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

app.get('/', function(req, res) {
  res.redirect('/home');
});
app.get('/home', routes.home);
// Handle all bet related pages.
app.get('/bet', routes.bet);
app.get('/bet/:category/:name?', betPages);


app.use(routes.notFound);

// function render_page(req, res) {
//   req.facebook.app(function(app) {
//     req.facebook.me(function(user) {
//       res.render('index.ejs', {
//         layout:    false,
//         req:       req,
//         app:       app,
//         user:      user
//       });
//     });
//   });
// }
// 
// function handle_facebook_request(req, res) {
// 
//   // if the user is logged in
//   if (req.facebook.token) {
//     async.parallel([
//       function(cb) {
//         // query 4 friends and send them to the socket for this socket id
//         req.facebook.get('/me/friends', { limit: 4 }, function(friends) {
//           req.friends = friends;
//           cb();
//         });
//       },
//       function(cb) {
//         // query 16 photos and send them to the socket for this socket id
//         req.facebook.get('/me/photos', { limit: 16 }, function(photos) {
//           req.photos = photos;
//           cb();
//         });
//       },
//       function(cb) {
//         // query 4 likes and send them to the socket for this socket id
//         req.facebook.get('/me/likes', { limit: 4 }, function(likes) {
//           req.likes = likes;
//           cb();
//         });
//       },
//       function(cb) {
//         // use fql to get a list of my friends that are using this app
//         req.facebook.fql('SELECT uid, name, is_app_user, pic_square FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1', function(result) {
//           req.friends_using_app = result;
//           cb();
//         });
//       }
//     ], function() {
//       render_page(req, res);
//     });
//   } else {
//     render_page(req, res);
//   }
// }
// 
// app.get('/', handle_facebook_request);
// app.post('/', handle_facebook_request);
