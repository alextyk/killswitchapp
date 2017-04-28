var sentencer = require("sentencer")
var request = require("request");
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

getAuthToken(function(data) {

console.dir(data);
  var options = { method: 'POST',
    url: 'https://apis.hootsuite.com/v1/messages',
    headers:
     { 'postman-token': '9a56a3ef-3f69-f3ee-5f03-99945169ddb9',
       'cache-control': 'no-cache',
       authorization: "Bearer " + data.access_token,
       'content-type': 'application/json' },
    body:
     { text: message,
       socialProfileIds: [ '63438119' ],
       scheduledSendTime: scheduledTime,
       webhookUrls: ["https://1832acbd.ngrok.io/api/message/event"],
       emailNotification: true },
    json: true };
    console.log(options);

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });
});
//{
//  "access_token": "d1765bc3-62fe-4e54-8824-226ebeb34cae",
//  "token_type": "Bearer",
  //"expires_in": 31536000,
//  "scope": "oob"
//}
