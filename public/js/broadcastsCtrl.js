
app.controller('broadcastCtrl', function($scope, $http) {
$scope.isVisible = false;
$scope.error = false;
$scope.incomplete = false;

$scope.listVisible = true;
$scope.stylereload = "glyphicon glyphicon-refresh";
$scope.styleremove = "glyphicon glyphicon-remove";
$scope.styleTabDevices = "";
$scope.isTansferVisible = true;
$scope.isTansferVisibleMedia = true;
$scope.fromvisible=false;
$scope.tovisible=false;
$scope.dailyfromvisible=false;
$scope.dailytovisible=false;
$scope.tab1=true;
$scope.tab2=false;
$scope.owner=0;

$scope.tags='';
$scope.medias='';


$scope.tabGI = function(){
	if ($scope.tab1 == false){
		$scope.tab1 = true;
		$scope.tab2 = false;
	}
}
$scope.tabDevices = function(){
	$scope.dateTest= new Date();
	if ($scope.tab2 == false){
		$scope.getPlayers();
		$scope.tab1 = false;
		$scope.tab2 = true;
	}
}


$scope.showDailyTo = function(){
	if ($scope.dailytovisible){
		$scope.dailytovisible = false;
	}else{
		$scope.dailytovisible = true;
	}
}
$scope.showDateTo = function(){
	if ($scope.tovisible){
		$scope.tovisible = false;
	}else{
		$scope.tovisible = true;
	}
}
$scope.showDailyFrom = function(){
	if ($scope.dailyfromvisible){
		$scope.dailyfromvisible = false;
	}else{
		$scope.dailyfromvisible = true;
	}
}
$scope.showDateFrom = function(){
	if ($scope.fromvisible){
		$scope.fromvisible = false;
	}else{
		$scope.fromvisible = true;
	}
}

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
$scope.getPlayers = function() {
  $scope.styleTabDevices = "glyphicon glyphicon-transfer";
  if ($scope.broadcastVisible == true ){
	$http.get('/online/broadcasts/'+$scope.id+'/playerCount').
	  success(function(data, status, headers, config) {
		$scope.devices = data;
		$scope.styleTabDevices = "";
	  }).
	  error(function(data, status, headers, config) {
	   console.log("error when retrieving the number of players link to this broadcast");
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

$scope.activateBroadcast= function(id,value,broad){
	broad.saving = true;
	$scope.id = id;
	$scope.name = null;
	$scope.datefrom = null;
	$scope.dateto = null;
	$scope.created = null;
	$scope.tags = null;
	$scope.medias = null;
	$scope.broadcasted = !value;
	
	$http.get('/online/broadcasts/'+$scope.id+'/tags').
	  success(function(data, status, headers, config) {
		$scope.tags = data;
		$scope.save();
	  }).
	  error(function(data, status, headers, config) {
	   console.log("error when retrieving selected tags");
	   $scope.broadcasted = !value;
	  });
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
	$scope.broadcasted = false;
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
	var currentDate = new Date().toISOString();
	var someDate = new Date();
	var duration = 30; //In Days
	someDate.setTime(someDate.getTime() +  (duration * 24 * 60 * 60 * 1000));
	$scope.created = currentDate;
	$scope.id= '';
	$scope.name = '';
	$scope.datefrom= currentDate;
	$scope.dateto= someDate.toISOString();
	$scope.owner= '';
	$scope.tags= '';
	$scope.medias= '';
	$scope.broadcasted= false;
};


$scope.save = function() {
	
	// SEND THE NEW CONTENT TO THE SERVER
	
	var data = {string: {id: $scope.id , name : $scope.name, datefrom: $scope.datefrom, dateto:$scope.dateto , owner: $scope.owner, tags: $scope.tags, medias: $scope.medias, broadcasted : $scope.broadcasted}};
	
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

$scope.removeBroadcast = function(idBroadcast,broadcast) {
	broadcast.removing = true;
	var data = {string: {id: idBroadcast }};
	$http.post('/online/broadcasts/r/', data).
	  then(function(response) {
		if (response.status == 200){
			$scope.reload(); // refresh the list
		}
	  }, function(error) {
		// called asynchronously if an error occurs
		console.log("> error when savings" + error);
	 });
	
};

$scope.checkStatus = function(broadcast){
	if (broadcast.saving){
		 return "glyphicon glyphicon-transfer";
	}
	if (broadcast.broadcasted){
		 return "glyphicon glyphicon-check";
	 }else{
		return "glyphicon glyphicon-unchecked";
	 }
};

$scope.checkRemoveStatus = function(broadcast){
	if (broadcast.removing){
		 return "glyphicon glyphicon-transfer";
	}else{
		 return "glyphicon glyphicon-remove";
	}
};


$scope.$watch('broadcastVisible',function() {$scope.reload();}); 

});