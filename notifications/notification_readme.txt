The notification system works as follows:

Every time an event happens which we want to log, we save the associated info that will be in the notification list. 
This also places the user in a queue which will be evaluated every 30 mintues.

When the queue is evaluated, each user will be notified if they have not received a notification in the last X minutes.
Otherwise they remain in the queue to be notified once we allow them to receive another notification (at that point they have not received another event within the allocated time)

When sending a user notification, we look for the highest priority event, and then sum the total number of occurences of the event for the user.  we then create and send that notification to the user, randomly selecting a creative from one of the matching creative types.  We then clear the user's list of pending notifications, and remove them from the queue.

The priorities and creatives are all currently stored in a config file which is autoloaded when the app starts.  This will be eventually switched over to a {TODO} redis db, so it can be changed on the fly in production.  When saving a user event, we check that the required fields are saved in the event, otherwise we issue a warning in the console.  

There should always be one creative per type that does not require additional parameters in case a change is made on the back end and suddenly these fields are not available.

{TODO} users entering the app on their own should get their notifications by some flag or shown upon landing, and then their pending status and notifications removed from the queue

{TODO} the client should should be able to receive an extension /link or #link with parameters to show these notifications upon landing in the app

You can specify options from 4 of the same notifications down to 0 in the config file.

It should look like the following in the correct json format:


{
  "creative":{
    "templates" : {
      "wonBet" : {
        "1" : [
          {
            "template" : "Congratulations, you won a bet",
            "creativeRef" : "wonBet1"
          },
          {
            "wonBet2" : "Congratulations, you won @amount on a bet",
            "creativeRef" : "wonBet2"
          },
          {
            "wonBet3" : "Congratulations, you beat @user and won a bet",
            "creativeRef" : "wonBet3"
          }
        ],
        "2" : [
          {
            "template" : "Congratulations, you won @count bets",
            "creativeRef" : "wonBet4"
          },
          {
            "template" : "Congratulations, you beat @user and @user in bets",
            "creativeRef" : "wonBet5" 
          }
        ],
        "3" : [
          {
             "template" : "Congratulations, you beat @user and @user, and @count other in bets",
             "creativeRef" : "wonBet7"
          }
        ],
        "4" : [
          {
            "template" : "Congratulations, you beat @user and @user, and @count others in bets",
            "creativeRef" : "wonBet8" 
          },
          {
            "template" : "Congratulations, you won @amount in @count bets",
            "creativeRef" : "wonBet9" 
          }
        ] 
      },
      "lostBet" : {
        "1" : [
          {
            "template" : "You just lost a bet. Bet again and improve your odds!",
            "creativeRef" : "lostBet1" 
          },
          {
            "template" : "You lost a bet on the @team.  Challenge @user again!",
            "creativeRef" : "lostBet2" 
          }
        ]
      },
       "betAccepted" : {
        "1" : [
          {
            "template" : "@user accepted your bet",
            "creativeRef" : "betAccepted1" 
          }
        ],
        "2" : [
         {
            "template" : "@user and @user accepted your bets",
            "creativeRef" : "betAccepted2" 
          }
        ]
      },
       "betPrompted" : {
        "1" : [
          {
            "template" : "@user challenged you to a bet!",
            "creativeRef" : "betPromted1" 
          },
          {
            "template" : "@user challenged you to bet on the @team",
            "creativeRef" : "betPromted2" 
          }
        ],
        "2" : [ ]
      }
    },
    "notificationPriority" : {
      "betPrompted" : 10,
      "wonBet" : 9,
      "betAccepted" : 1,
      "lostBet": 5
    },
    "creativeKeys" : [
      "@user",
      "@amount",
      "@count",
      "@team"
    ]
  },
  "notifQueueConfig" : {
    "minTimeBetweenNotifications" : 240
  }
}

