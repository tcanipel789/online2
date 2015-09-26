var spawn = require('child_process').spawn;

var cPlayerProcess;
var cmd = 'cplayer';

var initializeProcess = function (){
	console.log('New process initialization');
	
	var process = spawn(cmd, {stdio : 'inherit'});
	
	process.stdout.on('data', function(chunk) {
		console.log("clayer : "+chunk.toString());
	});
	
	process.once('exit', function (code, signal) {
		process = null;

		console.log("=>cPlayer has been terminated");

	});
	
	return process;
}

var closeProcess = function (){
	console.log("=>Kill Signal sent");
	cPlayerProcess.kill('SIGHUP');
}


cPlayerProcess = initializeProcess();



