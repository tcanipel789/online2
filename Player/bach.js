var spawn = require('child_process').spawn;
var fs = require("fs");
var playlistsPath = "/playlist/"; // "./playlist/" // PLAYLIST FOLDER ON DEVICE
var mediasPath = "/media/";    // "/medias/"   // MEDIAS FOLDER ON DEVICE
var path = require('path');

var cPlayerProcess;
var cmd = 'cplayer';
var lastplaylist = "";
var marker = process.argv[2];

var initializeProcess = function (){
        console.log('New process initialization');

        var process = spawn(cmd, {stdio : 'inherit'});


        process.once('exit', function (code, signal) {
                process = null;
				console.log("=>cPlayer has been terminated");
        });

        return process;
}

var closeProcess = function (){
        console.log("=>Kill Signal sent");
		if (cPlayerProcess) cPlayerProcess.kill('SIGHUP');
}

var checkSemaphore = function (){
	
	fs.readdir(playlistsPath, function(err,files){
		if (err){
			console.log("=> Error the playlistPath cannot be reach "+ err);
			return;
		}
	
		files = files.filter(function(file) { if ((path.extname(file) == ".sm")) return file});
		if (files != null && files.length != 0){
			if( lastplaylist != files[0]){ // new playlist loaded detected
				lastplaylist = files[0];
				
				// remove the semaphore
				fs.unlinkSync(playlistsPath+files[0], function (err) {
				  if (err)  console.log('=> Error :  deleting '+ files[0]);
				});
				
				closeProcess();
				cPlayerProcess = initializeProcess();
			}
		}
		if (marker != null){
			console.log("boot initialization..");
			closeProcess();
			cPlayerProcess = initializeProcess();
			marker=null;
		}
	});
}


setInterval(checkSemaphore, 1000);
