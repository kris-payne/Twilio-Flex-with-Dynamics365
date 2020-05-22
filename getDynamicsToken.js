exports.handler = function(context, event, callback) {
    var DynamicsWebApi = require('dynamics-web-api');
    var clientId = 'APPLICATION_(CLIENT)_ID';
    var AuthenticationContext = require('adal-node').AuthenticationContext;
    //OAuth Token Endpoint
    var authorityUrl = 'https://login.microsoftonline.com/<DIRECTORY_(TENANT)_ID>/oauth2/token';
    //CRM Organization URL
    var resource = 'https://<YOUR_ORG>.crm.dynamics.com';
    // var username = 'CustomerServiceBot@twilioaus.onmicrosoft.com';
    var username = 'you@yourorg.onmicrosoft.com';
    var password = 'yourpassword';
    var adalContext = new AuthenticationContext(authorityUrl);
    var tokenTemp='';
    //add a callback as a parameter for your function
    function acquireToken(dynamicsWebApiCallback){
        //a callback for adal-node
        function adalCallback(error, token) {
            if (!error){
                //call DynamicsWebApi callback only when a token has been retrieved
                tokenTemp=token.accessToken;
                dynamicsWebApiCallback(token);
                callback(null,tokenTemp);
            }
            else{
                console.log('Token has not been retrieved. Error: ' + error.stack);
                callback(error,null);
            }
        }
        //call a necessary function in adal-node object to get a token
        adalContext.acquireTokenWithUsernamePassword(resource, username, password, clientId, adalCallback);
    }
    var dynamicsWebApi = new DynamicsWebApi({
        webApiUrl: 'https://<YOUR_ORG>.api.crm.dynamics.com/api/data/v9.0/',
        onTokenRefresh: acquireToken
    });
    //call any function
    dynamicsWebApi.executeUnboundFunction("WhoAmI").then(function (response) {
        callback(null,tokenTemp);
    }).catch(function(error){
        callback(error,null);
    });
};