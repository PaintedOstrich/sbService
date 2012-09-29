/* 
 * Bet Model
 */

var mongoose = require('mongoose'),
       async = require('async');
var Bet = mongoose.model('Bet');

var bets = {}
    // Index
    app.get('/api/locations', function(req, res) {
      Location.find({}, function(err, locations) {
        res.json(locations);
      });
    });

    // Create
    app.post('/api/locations', function(req, res) {
      var saveLocation = function(location, callback) {
          // Save a location in here
          var instance = new Location(location);
          instance.save(function(err) {
            callback();
          });
          // console.log(req.body)
          console.log(location)
          // Save a location in here
          callback();
        };

      async.forEach(req.body.locations, saveLocation, function(err) {
        res.json(err);
      });
    });

    // Read
    app.get('/api/locations/:id', function(req, res) {
      Location.findById(req.params.id, function(err, location) {
        res.json(location);
      });
    });

    // Update
    app.post('/api/locations/:id', function(req, res) {});
  };

module.exports = locations;