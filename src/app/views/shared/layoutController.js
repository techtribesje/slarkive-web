'use strict';

app.controller('LayoutController', function($scope, $state, $cookieStore, $filter, Services){

    $scope.selectChannel = selectChannel;
    $scope.searchMessages = searchMessages;
    $scope.closeSearchBar = closeSearchBar;

    initChannel();
    loadChannels();

    function loadChannels() {

        Services.getChannels()
            .success(function (response) {
            $scope.channelList = response;
        })
            .error(function (error) {
            $scope.errorMsg = error.Message;
        })
            .finally(function () {

        });
    };

    function selectChannel(channel){
        $cookieStore.put('channel',channel);
        $scope.selectedChannel = channel

        $state.go('app.archive', {channel_id: channel.name });
    }

    function initChannel(){
        var channel = $cookieStore.get('channel');
        if (channel != null)
        {
            $scope.selectedChannel = channel
            $state.go('app.archive', {channel_id: channel.name });
        }
    }

    function searchMessages(search) {

        Services.searchMessages(search)
            .success(function (response) {
                $scope.messageList = response;
            })
            .error(function (error) {
                $scope.errorMsg = error.Message;
             })
            .finally(function () {
            });
    };

   function closeSearchBar(){
        angular.element('.sidebar-right').removeClass('sidebar-open')
    }
})



