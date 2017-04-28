var killSwitchEnable = false;
var sentencer = require("sentencer")
var request = require("request");
var bodyParser = require("body-parser")
var scheduledTime = new Date();
scheduledTime.setMinutes(scheduledTime.getMinutes()+10);
var message = sentencer.make("The {{ noun }} will be sold later today")
function getAuthToken(callback){
  var options = { method: 'POST',
    url: 'https://apis.hootsuite.com/auth/oauth/v2/token',
    headers:
     { 'postman-token': 'fea37b00-d212-bcf4-dba4-6f60d43dffe0',
       'cache-control': 'no-cache',
       'content-type': 'application/x-www-form-urlencoded' },
    form:
     { grant_type: 'client_credentials',
       client_id: 'l7xxeeba906b34a14c28858e5f720b09f692',
       client_secret: 'e7427af5c6e0437a98baefb373eb4427',
       '': '' } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    getMemberAuthCode(JSON.parse(body),function(data){

      callback(data);
    });
  });
}

function getMemberAuthCode(authtoken,callback) {
  var options = { method: 'POST',
  url: 'https://apis.hootsuite.com/v1/tokens',
  headers:
   { 'postman-token': '1107872b-36ee-d4a7-3b29-1d19d23dcee2',
     'cache-control': 'no-cache',
     authorization: "Bearer " + authtoken.access_token,
     'content-type': 'application/json;charset=utf-8' },
  body: '{\n  "memberId": 9817484\n}' };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  callback(JSON.parse(body));
});

}

var app = require("express")();
var server = require("http").Server(app);
app.use(bodyParser.json());
app.get("/startall", function(req, res) {
  killSwitchEnable = false;
  res.send("kill switch off");
});
app.get("/status", function(req, res) {
  res.send(killSwitchEnable);
});
app.get("/stopall", function(req, res){
  killSwitchEnable = true;
  getAuthToken(function(data){
    var startTime = new Date();
    var endTime = new Date ();
    endTime.setHours(24);
    var options = { method: 'GET',
      url: 'https://apis.hootsuite.com/v1/messages',
      qs:
       { startTime: startTime,
         endTime: endTime,
         state: 'SCHEDULED',
         socialProfileIds: [63438119] },
      headers:
       { 'postman-token': '3c69fcc8-19e9-7729-1cc2-9a420fe043ab',
         'cache-control': 'no-cache',
         authorization: "Bearer " + data.access_token,
         'content-type': 'application/json;charset=utf-8' }};

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      var messages = JSON.parse(body).data;
      // for(var i=0; i < messages.length; i++) {
      //   console.log(messages[i]);
      //   deleteMessage(messages[i].id, data.access_token, function(messageID){
      //     console.log("deleted " + messageID);
      //   });
      // }
      var messagesDeleted = [];
      var messagesCreated = [];
      var messages2 = messages.slice(0);
        deleteMessages(messages, data.access_token, messagesDeleted, function (messagesDeleted){
          createMessages(messages2, data.access_token, messagesCreated, function (messagesCreated) {
            res.send({messagesCreated: messagesCreated, messagesDeleted: messagesDeleted});
          });
        });


    });
  });
});
function createMessages(messages, access_token, messagesCreated, callback) {
  if (messages !== null && messages.length>0) {
    var message = messages.pop();
    var scheduledTime = new Date(message.scheduledSendTime);
    scheduledTime.setHours(24);

    createMessage(message, scheduledTime, access_token, function(message){
      console.log("created " + message.id);
      messagesCreated.push(message);
      createMessages(messages, access_token, messagesCreated, callback);
    });

  } else {
    console.log("done");
    callback(messagesCreated);
  }
}
function deleteMessages(messages, access_token, messagesDeleted, callback) {

  if (messages !== null && messages.length>0) {
    var message = messages.pop();
    deleteMessage(message.id, access_token, function(messageID){
      console.log("deleted " + messageID);
      messagesDeleted.push(messageID);
      deleteMessages(messages, access_token, messagesDeleted, callback);
    });

  } else {
    console.log("done");
    callback(messagesDeleted);
  }
}
function deleteMessage(messageID, access_token, callback) {
  var options = { method: 'DELETE',
  url: 'https://apis.hootsuite.com/v1/messages/' + messageID,
  headers:
   { 'postman-token': 'e41c8854-dc67-d32d-0c71-b556a61ab3d0',
     'cache-control': 'no-cache',
     authorization: "Bearer " + access_token } };
request(options, function (error, response, body) {
  if (error) throw new Error(error);

  callback(messageID);
});

}
function createMessage(message, scheduledTime, access_token, callback) {
  var options = { method: 'POST',
    url: 'https://apis.hootsuite.com/v1/messages',
    headers:
     { 'postman-token': '9a56a3ef-3f69-f3ee-5f03-99945169ddb9',
       'cache-control': 'no-cache',
       authorization: "Bearer " + access_token,
       'content-type': 'application/json' },
    body:
     { text: message.text,
       socialProfileIds: [message.socialProfile.id],
       scheduledSendTime: scheduledTime,
       emailNotification: true },
    json: true };
    console.log(options);

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    callback(body);
  });
}

app.post("/message/event", function(req, res) {
  console.log(req.body);
  res.send("thanks");

});


server.listen(8888);
