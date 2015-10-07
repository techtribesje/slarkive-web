'use strict';

//-------------------------------------------------------------
//     CONSTANTS
//-------------------------------------------------------------
app.constant('AppSettings', {
    AppName: 'slarkive',
    AppVersion: '0.0.1',
    ApiUrl: 'http://localhost:8088/slarkive-web/src/api/',
    SlackUrl: 'https://slack.com/api/',
    Slackclient_id: "",
    Slackredirect_uri:"http://localhost:8088/slarkive-web/src/callback.html",
    Slackteam:""
    
});

//-------------------------------------------------------------
//     CONFIG
//-------------------------------------------------------------
app.config(function ($httpProvider) {
    $httpProvider.defaults.cache = false;

    $httpProvider.interceptors.push(['$q', '$location', 'AppSettings',  function ($q, $location, AppSettings) {
        return {
            request: function (config) {

                if (config.url.indexOf(AppSettings.ApiUrl) >= 0)
                {
                    var token = localStorage.getItem('token');
                    if (token) {
                        config.headers.Authorization = token;
                    }
                }

                return config;
            },
            responseError: function (response) {
                if (response.status === 401 || response.status === 403) {
                    $location.path('/login');
                }
                return $q.reject(response);
            }
        };
    }]);
});

//-------------------------------------------------------------
//     RUN
//-------------------------------------------------------------

app.run(function ($rootScope, $state) {

    $rootScope.$state = $state;

    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        $rootScope.title = $state.current.data.pageTitle;
    });

});


