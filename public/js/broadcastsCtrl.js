
app.controller('broadcastCtrl', function($scope, $http) {
$scope.isVisible = false;
$scope.error = false;
$scope.incomplete = false;

$scope.listVisible = true;
$scope.stylereload = "glyphicon glyphicon-refresh";
$scope.styleremove = "glyphicon glyphicon-remove";
$scope.isTansferVisible = true;
$scope.isTansferVisibleMedia = true;

$scope.tags='';
$scope.medias='';

$scope.showTag = function(){
	if ($scope.tagVisible){
		$scope.tagVisible = false;
	}else{
		$scope.tagVisible = true;
	}
}

$scope.showMedia = function(){
	if ($scope.mediaVisible){
		$scope.mediaVisible = false;
	}else{
		$scope.mediaVisible = true;
	}
}


$scope.toggleSelection = function(obj){
	if(obj.selected != null){
		obj.selected = !obj.selected;
	}else{
		obj.selected = true;
	}
}

$scope.getMedias = function() {
  $scope.isTansferVisibleMedia = true;
  if ($scope.broadcastVisible == true ){
	$http.get('/online/broadcasts/'+$scope.id+'/medias').
	  success(function(data, status, headers, config) {
		$scope.medias = data;
		$scope.isTansferVisibleMedia = false;
	  }).
	  error(function(data, status, headers, config) {
	   $scope.mediaerror = 'error when retrieving selected medias';
	   console.log("error when retrieving selected medias");
	   $scope.isTansferVisibleMedia = false;
	  });
  }
};

$scope.getTags = function() {
  $scope.isTansferVisible = true;
  if ($scope.broadcastVisible == true ){
	$http.get('/online/broadcasts/'+$scope.id+'/tags').
	  success(function(data, status, headers, config) {
		$scope.tags = data;
		$scope.isTansferVisible = false;
	  }).
	  error(function(data, status, headers, config) {
	   $scope.tagerror = 'error when retrieving selected tags';
	   console.log("error when retrieving selected tags");
	   $scope.isTansferVisible = false;
	  });
  }
};

$scope.reload = function() {
	if ($scope.broadcastVisible == true){
		$scope.stylereload = "glyphicon glyphicon-transfer";
		$http.get('/online/broadcasts').
		  success(function(data, status, headers, config) {
			$scope.broadcasts = data;
			$scope.stylereload = "glyphicon glyphicon-refresh";
		  }).
		  error(function(data, status, headers, config) {
		   console.log("error when retrieving broadcasts");
		    $scope.stylereload = "glyphicon glyphicon-refresh";
		  });
	}
}



$scope.editBroadcast = function(id) {
	$scope.listVisible = false;
	$scope.isVisible = true;
	$scope.tagVisible = false;
	$scope.mediaVisible = false;
	
	var index = 0;
	var numBroadcast;
	for(var i = 0, numBroadcast = $scope.broadcasts.length; i < numBroadcast; i++)
	{
	  if($scope.broadcasts[i].id == id)
	  {
		index = i;
	  }
	}
	
	$scope.name = $scope.broadcasts[index].name;
	$scope.datefrom = $scope.broadcasts[index].datefrom;
	$scope.dateto = $scope.broadcasts[index].dateto;
	$scope.created = $scope.broadcasts[index].created;
	$scope.id = id;
	$scope.tags=[];
	$scope.medias=[];
	
	
	$scope.getTags();
	$scope.getMedias();

};



$scope.cancel = function() {
 $scope.isVisible = false;
 $scope.listVisible = true;
};

$scope.addBroadcast = function(){
	$scope.isVisible = true;
	$scope.listVisible = false;
	var date = new Date().toISOString();
	$scope.created = date;
	$scope.id= '';
	$scope.name = '';
	$scope.datefrom= '';
	$scope.dateto= '';
	$scope.owner= '';
	$scope.tags= '';
	$scope.medias= '';
};


$scope.save = function() {
	
	// SEND THE NEW CONTENT TO THE SERVER
	var data = {string: {id: $scope.id , name : $scope.name, datefrom: $scope.datefrom, dateto:$scope.dateto , owner: $scope.owner, tags: $scope.tags, medias: $scope.medias}};
	$scope.styleSave="glyphicon glyphicon-transfer";
	$http.post('/online/broadcasts/brd', data).
	  then(function(response) {
		if (response.status == 200){
			$scope.styleSave="glyphicon glyphicon-save";
			$scope.isVisible = false;
			$scope.listVisible = true;
			$scope.reload(); // refresh the list
		}
	  }, function(error) {
		// called asynchronously if an error occurs
		console.log("> error when saving " + error);
		$scope.styleSave="glyphicon glyphicon-save";
	  });
	
};

$scope.removeBroadcast = function(idBroadcast) {
	$scope.styleremove = "glyphicon glyphicon-transfer";
	var data = {string: {id: idBroadcast }};
	$http.post('/online/broadcasts/r/', data).
	  then(function(response) {
		if (response.status == 200){
			$scope.styleremove = "glyphicon glyphicon-remove";
			$scope.reload(); // refresh the list
		}
	  }, function(error) {
		// called asynchronously if an error occurs
		console.log("> error when savings" + error);
		$scope.styleremove = "glyphicon glyphicon-remove";
	  });
	
};



$scope.$watch('broadcastVisible',function() {$scope.reload();}); 

});