var spawn = require('child_process').spawn;

var omxProcess = [];

var cmd = 'omxplayer';
var cpt = 0;
var exitLoop = true;
var loop = true;
var number = 0;
var commands = {
    'pause': 'p',
	'play': 'p',
    'quit': 'q',
    'volup': '+',
    'voldown': '-'
  };

var videosObj =[
	{
	 path : '../2.mp4',
	 duration : 9000
	},
	{
	 path : '../3.mp4',
	 duration : 9000
	}
];


var fork =0;

var playlist  = function (){
	console.log('start playlist');

	// preparing first && second videos
	prepareNext();
	setTimeout(function () {
      prepareNext();
    }, 1000);
};	

var nextVideo = function (){
	var videoObj = videosObj.shift();
	if(loop == true){
		videosObj.push(videoObj);
	}
	console.log("Playlist size : " + videosObj.length);
	return videoObj;
}

var initializeProcess = function (cmd,args,duration){

	var process = spawn(cmd, args , {
		stdio: ['pipe', null, null]
	  });
	  process.duration  = duration;
	console.log('New process initialized');
	
	process.once('exit', function (code, signal) {
		process = null;
		console.log("===============cleaning process==============="+number);
		number +=1;
		console.log("a process is free, reuse it for the next video if needed");
		console.log("unlock the previous video when the current one is done : ");
		sendAction(omxProcess[fork-1],'play');
		console.log("duration : "+ omxProcess[fork-1].duration );
		// pop older process of omxProcess
		omxProcess.shift();
		fork -=1;
		
		console.log('Prepare the next video if needed - paused - ');
		setTimeout(function () {
			prepareNext();
		}, 2000);
		console.log("size of omxprocess : "+omxProcess.length); // always equal to 2 (2 process runs simultaneously)
		console.log("===============>cleaning process<===============");
	});
	
	return process;
}



var prepareNext = function (){
	console.log("===============Prepare Next============");
	var videoObj = nextVideo();
	if (videoObj){
		console.log("prepare the next video - paused -  : "+ videoObj['path']);
		var args =[];
		args.push('--no-osd'); // no control display
		args.push('-b'); // clear screen
		args.push(videoObj['path']); // filepath of the video
		omxProcess.push(initializeProcess(cmd,args,videoObj['duration']));
		if (fork != 0)sendAction(omxProcess[fork],'pause'); // pause the video (just loaded)
		fork +=1;

		console.log("size of omxprocess : "+omxProcess.length);
	}else{
	console.log("no more videos to play");
	}
	console.log("===============>Prepare Next<============");
};


var sendAction = function(process,action){
	if (process) {
      try {
        process.stdin.write(commands[action], function (err) {
          console.log("action executed : "+ action);
        });
      } catch (err) {
        console.log(err);
      }
    }else{
		console.log('error : trying to send command to empty process');
	}
}
playlist();



