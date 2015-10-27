app.controller('mainCtrl', function($scope, $http) {

 console.log("mainCtrl initiate");	
 
 $scope.playerVisible = false;
 $scope.mediaVisible = false;
 $scope.broadcastVisible = false;
 $scope.programVisible = false;

 
 $scope.player = function(){
	$scope.playerVisible = true;
	$scope.mediaVisible = false;
	$scope.broadcastVisible = false;
	$scope.programVisible = false;
 };
  
 $scope.media= function(){
	$scope.playerVisible = false;
	$scope.mediaVisible = true;
	$scope.broadcastVisible = false;
	$scope.programVisible = false;
 };
  
 $scope.broadcast= function(){
	$scope.playerVisible = false;
	$scope.mediaVisible = false;
	$scope.broadcastVisible = true;
	$scope.programVisible = false;
 };
  
 $scope.program= function(){
	$scope.playerVisible = false;
	$scope.mediaVisible = false;
	$scope.broadcastVisible = false;
	$scope.programVisible = true;
 };
 
 
});