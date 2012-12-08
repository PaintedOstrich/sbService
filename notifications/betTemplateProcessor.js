// randomly selects a template from the template list
var generateSportsTemplate = function(templateList, notifList) {
  while(templateList.length >0) {
    var creativeIndex = Math.floor(Math.random() * actionTypeList.length);
    var template = templateList.pop(creativeIndex);


  }
  
}

var tryReplaceKey = function(template, notifList) {
  for (var index in words) {
    if (words[index].indexOf('@') != -1){
      
    }
  }
}

var listOfReplace = function(action, notifList) {
  if (action === '@amount') {
    var amount = 0;
    for (var index in notifList) {
      var notif = notifList[index];
      if (!notif.amount) {
        return;
      }
      else {
        amount += parseInt(notif.amount);
      }
    }

    return amount;
  }
  
  if (action === '@user') {
    var count = temp.match(/@user/g); 
    
  }
}

// "wonBet4" : "Congratulations, you beat @user and @user in bets"

 [ { actionType: 'wonBet', against: '12345', amount: '0.30' },
     { actionType: 'wonBet', against: '123', amount: '1.30' } ]