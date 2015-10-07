'use strict';

app.controller('LoginController', function ($scope, $state, $stateParams, Services, slackServices) {

    $scope.signIn= signIn;
    $scope.continue = gotoMessages;

    init();

    function init(){

        var code = $stateParams.code 
        if (code != null && code.length > 0){
            getToken(code);
        }
        else{
            getUserInfo();
        }
    }

    function signIn(){
        slackServices.authorize();
    }

    function gotoMessages(){
        $state.go('app.archive');
    }

    function getToken(code){

        Services.getToken(code).success(function(data) {

            if (data.ok){
                $scope.token = data.access_token;
                localStorage.setItem('token', $scope.token);
                
                getUserInfo();
            }
            else
                $scope.errorMessage = data.error;

        }).finally(function () {

        });
    }

    function getUserInfo(){
        
        var token = localStorage.getItem('token');
        if (token){
            $scope.token = token;
            slackServices.authTest(token, function(response){
                if(response.ok){

                    slackServices.getUserinfo(token, response.user_id, function(response){
                        if(response.ok){
                            $scope.userName = response.user.name;
                        }
                    });

                }
            });  
        }
    }
});


