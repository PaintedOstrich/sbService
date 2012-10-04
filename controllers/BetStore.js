var BetStore = (function () {

  var gameKey = "game:";

  return {

    makeKey: function (gameId) {
      return gameKey + gameId;
    },

    setBaseInfo: function () {
      console.log( "counter value prior to reset: " + counter );
      counter = 0;
    }
  };

})();

// want to create objects, and apply a prototype to interact with the model