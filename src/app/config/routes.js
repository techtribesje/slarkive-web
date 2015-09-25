'use strict';

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/archive/");
    $stateProvider
        .state('app', {
        abstract: true,
        url: "",
        templateUrl: "app/views/shared/layout.html",
        controller: 'LayoutController',
    })
        .state('app.archive', {
        url: "/archive/{channel_id}",
        templateUrl: "app/views/archive/index.html",
        controller: 'ArchiveController',
        data: { pageTitle: 'Archive' }
    })
        .state('app.archivet', {
        url: "/archive/{channel_id}/{ts}",
        templateUrl: "app/views/archive/index.html",
        controller: 'ArchiveController',
        data: { pageTitle: 'Archive' }
    })



});
