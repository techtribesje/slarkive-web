'use strict';

app.service("slackServices", function ($http, $log, AppSettings) {

    this.authorize = authorize;
    this.getUserinfo = getUserinfo;
    this.authTest = authTest;
    this.getUserinfo = getUserinfo;

    function authorize() {
        var client_id = AppSettings.Slackclient_id;
        var redirect_uri = AppSettings.Slackredirect_uri;
        var scope = "read";
        var state = "token";
        var team = AppSettings.Slackteam;
        var url = "https://slack.com/oauth/authorize?scope="+scope+"&client_id="+client_id+"&redirect_uri="+redirect_uri+
            "&state="+state+"&team="+team;
        
        window.location.replace(url);
    };

    function authTest(token, callback) {
        var params = {
            token: token 
        };
        executeApiCall("auth.test", params, callback);
    }

    function getUserinfo(token, userId, callback) {
        var params = {
            token: token,
            user: userId
        };
        executeApiCall("users.info", params, callback);
    }

    function executeApiCall(endpoint, paramsObj, callback) {
        var qs = toQueryString(paramsObj);
        var url = AppSettings.SlackUrl + endpoint + "?" + qs;
        executeGetRequest(url, callback);
    }
    
    function executeGetRequest(url, callback) {
        $http.get(url).
        success(function (result) {
            if (callback)
                callback(result);
        }).
        error(function (data, status) {
            $log.log(status);
            $log.log(data);
        });
    }

    function toQueryString(obj) {
        var parts = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
        return parts.join("&");
    }
});
