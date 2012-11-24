var suite = vows.describe('pickmonapitest');

/* Test proper downloading and processing of game info */
suite.addBatch({
	 'A context': {
        topic: function () {/* Do something async */
        	this.callback
        },
        'I am a vow': function (topic) {
            /* Test the result of the topic */
        },
        'A sub-context': {
           /* Executed when the tests above finish running */
       }

    },
})