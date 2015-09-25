'use strict';

//-------------------------------------------------------------
//     CONSTANTS
//-------------------------------------------------------------
app.constant('AppSettings', {
    AppName: 'slarkive',
    AppVersion: '0.0.1',
    ApiUrl: 'http://localhost:8088/slarkive-web/src/api/',
});

//-------------------------------------------------------------
//     CONFIG
//-------------------------------------------------------------
app.config(function ($httpProvider) {
    $httpProvider.defaults.cache = false;
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

