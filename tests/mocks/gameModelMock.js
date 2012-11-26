var GameModelMock = function(){
	 this.gid = null;
	 this.processed = 'false';
};

GameModelMock.prototype.getGameIdFromHeaderAndDate = function(possibleGameId, header, datetime, cb) {

	if (typeof this.gid === "undefined") {
		this.gid = possibleGameId;
	}

	cb(null, this.gid);
}

GameModelMock.prototype.gameHasBeenProcessed = function(gameId, cb) {
	console.log('pr : '+ this.processed)
	cb(null, this.processed);
}

GameModelMock.prototype.setGameInfo = function(gameId, gameInfo, cb) {
	cb(null);
}

module.exports = GameModelMock;