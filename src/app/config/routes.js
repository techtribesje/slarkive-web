'use strict';

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login/");
    $stateProvider
    .state('app', {
        abstract: true,
        url: "",
        templateUrl: "app/views/shared/layout.html",
        controller: 'LayoutController',
    })
    .state('login', {
        url: "/login/:code",
        templateUrl: "app/views/login/login.html",
        controller: 'LoginController',
        data: { pageTitle: 'Login' }
    })
    .state('app.archive', {
        url: "/archive/{channel_id}",
        templateUrl: "app/views/messages/message.html",
        controller: 'MessageController',
        data: { pageTitle: 'Messages' }
    })
    .state('app.archived', {
        url: "/archive/{channel_id}/{ts}",
        templateUrl: "app/views/messages/message.html",
        controller: 'MessageController',
        data: { pageTitle: 'Messages' }
    })
});
