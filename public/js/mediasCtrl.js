
app.controller('mediaCtrl', function($scope, $http) {

$scope.edit = true;
$scope.error = false;
$scope.incomplete = false;

$scope.name = '';
$scope.ftplink = '';
$scope.owner = '';
$scope.sha1 = '';
$scope.created = '';
$scope.size = '';
$scope.type = 'video';
$scope.id = '';
$scope.tags = '';

$scope.isVisible = false;
$scope.listVisible = true;
$scope.isTansferVisible = true;
$scope.tagVisible = false;
$scope.styleSave="glyphicon glyphicon-save";
$scope.stylereload = "glyphicon glyphicon-refresh";




$scope.select = function (type){
	$scope.type = type.name;
};

$scope.reload = function() {

	if ($scope.mediaVisible == true){
	$scope.stylereload = "glyphicon glyphicon-transfer";
	
	$http.get(app.server+'online/medias').
	  success(function(data, status, headers, config) {
		$scope.medias = data;
		$scope.stylereload = "glyphicon glyphicon-refresh";
	  }).
	  error(function(data, status, headers, config) {
	   console.log("error when retrieving devices");
	   $scope.stylereload = "glyphicon glyphicon-refresh";
	  });
	}
	$scope.getTypes();

};

$scope.getTypes= function() {
  if ($scope.mediaVisible == true ){
	$http.get(app.server+'online/medias/types').
	  success(function(data, status, headers, config) {
		$scope.types = data;
	  }).
	  error(function(data, status, headers, config) {
	   console.log("error when retrieving types");
	  });
  }
};


$scope.showTag = function(){
	if ($scope.tagVisible){
		$scope.tagVisible = false;
	}else{
		$scope.tagVisible = true;
	}
} 

$scope.toggleSelection = function(tag){
	if(tag.selected != null){
		tag.selected = !tag.selected;
	}else{
		tag.selected = true;
	}
}

$scope.editMedia = function(id) {
	$scope.isVisible = true;
	$scope.listVisible = false;

	var index = 0;
	var numMedias;
	for(var i = 0, numMedias = $scope.medias.length; i < numMedias; i++)
	{
	  if($scope.medias[i].id == id)
	  {
		index = i;
	  }
	}

	$scope.edit = false;
	
	$scope.name = $scope.medias[index].name;
	$scope.ftplink = $scope.medias[index].ftplink;
	$scope.owner = $scope.medias[index].owner;
	$scope.sha1 = $scope.medias[index].sha1;
	$scope.created = $scope.medias[index].created;
	$scope.size = $scope.medias[index].size;
	$scope.type = $scope.medias[index].type;
	$scope.id = id;
	
	//$scope.getMediasTags();
};

$scope.cancel = function() {
 $scope.isVisible = false;
 $scope.listVisible = true;
};

$scope.addMedia = function(){
	$scope.isVisible = true;
	$scope.listVisible = false;

	$scope.edit = false;
	
	$scope.name = '';
	$scope.ftplink = '';
	$scope.owner = '';
	$scope.sha1 = '';
	$scope.created = new Date().toISOString();
	$scope.size = '';
	$scope.type = $scope.types[0].name;
	$scope.id = '';
	$scope.tags = '';
	
	//$scope.getMediasTags();
};

$scope.save = function() {
	
	// SEND THE NEW CONTENT TO THE SERVER
	
	var data = {string: {id: $scope.id , name: $scope.name , ftplink: $scope.ftplink, tags: $scope.tags , type: $scope.type}};
	$scope.styleSave="glyphicon glyphicon-transfer";
	$http.post(app.server+'online/medias/'+$scope.name, data).
	  then(function(response) {
		if (response.status == 200){
			$scope.styleSave="glyphicon glyphicon-save";
			$scope.isVisible = false;
			$scope.listVisible = true;
			$scope.reload(); // refresh the list
		}
	  }, function(error) {
		// called asynchronously if an error occurs
		console.log("> error when savings" + error);
		$scope.styleSave="glyphicon glyphicon-save";
	  });
	
};
$scope.removeMedia = function(idMedia,media) {
	media.removing=true;
	var data = {string: {id: idMedia }};
	$http.post(app.server+'online/medias/r/', data).
	  then(function(response) {
		if (response.status == 200){
			$scope.reload(); // refresh the list
		}
	  }, function(error) {
		// called asynchronously if an error occurs
		console.log("> error when savings" + error);
	  });
	
};

$scope.checkRemoveStatus = function(media){
	if (media.removing){
		 return "glyphicon glyphicon-transfer";
	}else{
		 return "glyphicon glyphicon-remove";
	}
};

$scope.$watch('mediaVisible',function() {$scope.reload();}); 




});