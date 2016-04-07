
 $scope.activate = function(){
 cordova.plugins.locationManager.isBluetoothEnabled()
	.then(function(isEnabled){
		console.log("isEnabled: " + isEnabled);
		if (isEnabled) {
			cordova.plugins.locationManager.disableBluetooth();
		} else {
			cordova.plugins.locationManager.enableBluetooth();        
		}
	})
	.fail(console.error)
	.done(); 
 };
 
 $scope.delegate = function(){
	 var delegate = new cordova.plugins.locationManager.Delegate();
	 delegate.didDetermineStateForRegion = function (pluginResult) {

		$scope.logToDom('\n[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));

		cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: '
			+ JSON.stringify(pluginResult));
		};
		
		delegate.didStartMonitoringForRegion = function (pluginResult) {
			console.log('didStartMonitoringForRegion:', pluginResult);

		$scope.logToDom('\ndidStartMonitoringForRegion:' + JSON.stringify(pluginResult));
		};

		delegate.didRangeBeaconsInRegion = function (pluginResult) {
			$scope.logToDom('\n[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
			var beaconRegion = $scope.createBeacon();
			cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
			.done();
		};
		
		var beaconRegion = $scope.createBeacon();
		
		cordova.plugins.locationManager.setDelegate(delegate);
		
		cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
		.fail(console.error)
		.done();
  };
  
 $scope.logToDom = function (message) {
	$scope.message += message;
  };