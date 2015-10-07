'use strict';

app.service("Services", function ($http, AppSettings) {

    var urlBase = AppSettings.ApiUrl;
    
    this.getMessages = getMessages;
    this.getChannels = getChannels;
    this.searchMessages = searchMessages;
    this.getToken = getToken;
    
    function getMessages(channel_id, ts) {
        var params = channel_id;

        if (ts)
            params=channel_id + '/' + ts;

        return $http.get(urlBase + 'messages/' + params );
    }

    function getChannels() {
        return $http.get(urlBase + 'channels');
    }

    function searchMessages(search) {
        return $http.get(urlBase + 'search/' + search);
    }

    function getToken(code) {
        return $http.get(urlBase + 'token/' + code);
    }
});
