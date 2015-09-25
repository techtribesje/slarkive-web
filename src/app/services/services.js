'use strict';

app.service("Services", function ($http, AppSettings) {

    var urlBase = AppSettings.ApiUrl;

    this.getArchiveMessages = function (channel_id, ts) {
        var params = channel_id;

        if (ts)
            params=channel_id + '/' + ts;

        return $http.get(urlBase + 'messages/' + params );
    }

    this.getChannels = function () {
        return $http.get(urlBase + 'channels');
    }

    this.searchMessages = function (search) {
        return $http.get(urlBase + 'search/' + search);
    }
});
