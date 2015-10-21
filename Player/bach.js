var spawn = require('child_process').spawn;
var fs = require("fs");
var playlistsPath = "/playlist/"; // "./playlist/" // PLAYLIST FOLDER ON DEVICE
var mediasPath = "/media/";    // "/medias/"   // MEDIAS FOLDER ON DEVICE
var path = require('path');

var cPlayerProcess;
var cmd = 'cplayer';
var lastplaylist = "";

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

var checkMainPlaylist = function (){
	fs.readdir(playlistsPath, function(err,files){
		if (err){
			console.log("=> Error the playlistPath cannot be reach "+ err);
			return;
		}
	
		files = files.filter(function(file) { if ((path.extname(file) === ".pl")&&(path.basename(file,'.pl') != "main")) return file});
		if (files != undefined){
			if( lastplaylist != files[0]){ // new playlist loaded detected
				lastplaylist = files[0];
				closeProcess();
				cPlayerProcess = initializeProcess();
			}
		}
	});
}


//cPlayerProcess = initializeProcess();
setInterval(checkMainPlaylist, 10000);
