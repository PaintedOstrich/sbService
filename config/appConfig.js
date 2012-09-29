/**
 * Module dependencies.
 * Express routing and error handling config
 */
module.exports = function(app, express){

  var bodyLimiter = require('../middleware/bodyLimiter');

  //generic config
  app.configure(function(){
    app.set('port', process.env.PORT || 5000);
    app.use(bodyLimiter);
    app.use(express.bodyParser());
    app.use(express.cookieParser('bdae@gkdl{dd}]fb132afet;dsfasdfbxcwerd'));
    app.use(express.session({secret: process.env.SESSION_SECRET || 'secret123'}));

    app.use(app.router);
    
    app.use(require('faceplate').middleware({
      app_id: process.env.FACEBOOK_APP_ID,
      secret: process.env.FACEBOOK_SECRET,
      scope:  'user_likes,user_photos,user_photo_video_tags'
    }));
  });

  //env specific config
  // development only
  app.configure('development', function() {
    app.use(express.logger('dev'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  // production only
  app.configure('production', function() {
    app.use(express.logger());
    app.use(express.errorHandler());
  })
};
