'use strict';

app.controller('ArchiveController', function ($scope, $rootScope, $state, $stateParams, $cookieStore, Services) {

    $scope.loadMessages = loadMessages;
    $scope.archivePage = {};
    $scope.noMessages = false;

    loadMessages();
    closeSearchBar();

    function loadMessages() {

        $scope.archivePage.isLoading = true;
        var channel_id = $stateParams.channel_id
        var ts = $stateParams.ts

        if (channel_id == ''){
            $scope.errorMessage = 'Select a Channnel';
        }
        else{
            $scope.selectedChannel.name = channel_id;
            
            Services.getArchiveMessages(channel_id, ts)
                .success(function(data) {
                $scope.archivePage = data;

                if ($scope.archivePage.messages.length == 0)
                    $scope.errorMessage = "No messages in this channel";
            })
                .finally(function () {
                $scope.archivePage.isLoading = false;
            });
        }
    };

    function closeSearchBar(){
        angular.element('.sidebar-right').removeClass('sidebar-open')
    }
});

