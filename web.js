

// app.get('/', function(req, res) {
//   res.redirect('/home');
// });
// app.get('/home', routes.home);
// // Handle all bet related pages.
// app.get('/bet', routes.bet);
// app.get('/bet/:category/:name?', betPages);

// app.use(routes.notFound);

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

// function handle_facebook_request(req, res) {

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

// app.get('/', handle_facebook_request);
// app.post('/', handle_facebook_request);
