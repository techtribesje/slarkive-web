'use strict';

app.controller('LayoutController', function($scope, $state, $cookieStore, $filter, Services, slackServices){

    $scope.selectChannel = selectChannel;
    $scope.searchMessages = searchMessages;
    $scope.closeSearchBar = closeSearchBar;
    $scope.signOut = signOut;

    initChannel();
    loadChannels();
    getUserInfo();

    function signOut(){
        localStorage.removeItem('token');
        $state.go('login');
    }

    function getUserInfo(){

        var token = localStorage.getItem('token');

        slackServices.authTest(token, function(response){
            if(response.ok){
                $scope.user_id = response.user_id;

                slackServices.getUserinfo(token, $scope.user_id, function(response){
                    if(response.ok){
                        $scope.userName = response.user.name;
                    }
                });
            }
            else{
                signOut()
            }

        });

    }

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



