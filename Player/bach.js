var spawn = require('child_process').spawn;
var fs = require("fs");
var playlistsPath = "/playlist/"; // "./playlist/" // PLAYLIST FOLDER ON DEVICE
var mediasPath = "/media/";    // "/medias/"   // MEDIAS FOLDER ON DEVICE
var path = require('path');

var cPlayerProcess=null;
var cmd = 'cplayer';
var lastplaylist = "";
var marker = process.argv[2];

var initializeProcess = function (){
        console.log('> Bach : New process initialization');

        var process = spawn(cmd, {stdio : 'inherit'});


        process.once('exit', function (code, signal) {
                process = null;
				console.log("> Bach : cPlayer has been terminated");
				// relaunch a new process after 1s
				setTimeout(function() {
					cPlayerProcess = initializeProcess();
				}, 1000);
        });

        return process;
}

var closeProcess = function (){
        console.log("> Bach : Kill Signal sent");
		if (cPlayerProcess != null) {
			console.log("> Bach : access the process");
			cPlayerProcess.kill('SIGHUP');
		}
}

var checkSemaphore = function (){

	
	if (marker != null){
		console.log("> Bach : boot initialization..");
		closeProcess();
		cPlayerProcess = initializeProcess();
		marker=null;
	}

	// Any change to the main playlist means a restart of the cplayer
	fs.watchFile(playlistsPath+"main.pl", function (curr, prev) {
		  //console.log('the current mtime is: ' + curr.mtime);
		  //console.log('the previous mtime was: ' + prev.mtime);
		  console.log("> Bach : Change detected in the main playlist")
		  closeProcess();
	});
		
}

checkSemaphore();
