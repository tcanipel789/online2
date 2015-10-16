var http = require("http");
var querystring = require('querystring');
var fs = require("fs");
var path = require('path');
var exec = require('child_process').exec;
var shortid = require('shortid');


var server = "http://arcane-oasis-9800.herokuapp.com";  // SERVER URL
//var serverPortSSL = '443';
var serverIp   = 'arcane-oasis-9800.herokuapp.com';
var download = true;
var playlistsPath = "/playlist/"; // "./playlist/" // PLAYLIST FOLDER ON DEVICE
var mediasPath = "/medias/";    // "/medias/"   // MEDIAS FOLDER ON DEVICE
var _temp = '-';
var _mac  = getMac();
var _mem = '-';
var _ip ='-';
var refresh = "/online/broadcasts/"+_mac; // URL WITH PLAYER NAME

/*
/ Functions to fetch every 10s if a new playlist is available
*/
var updatePlaylist = function(){
  http.get(server+"/online/broadcasts/"+_mac, function(res) {
	  res.on("data",function (data){
			
			if (res.statusCode != 404){
				console.log("=> New main playlist available");
			var playlistObj = JSON.parse(data);	
			var playlistName = shortid.generate();
			
			fs.writeFile(playlistsPath+playlistName+".pl", JSON.stringify(playlistObj), function (err) {
			  if (err){
				console.log("=> Error : Playlist not saved "+err);
			  }else{
				console.log("=> Playlist saved ");
			  }
			});
			}else{
				console.log("=> No new main playlist available");
			}
		})
	}).on('error', function(e) {
	  console.log("=> Error when fetching the broadcast request : " + e.message);
	});
}

/*
*/

/*
/ Media manager FTP
*/
/* check if for a playlist a media is missing, if so, then launch the download
/  - One download at a time
*/
/*
var downloadManager = function (){
	
	if (download == true){ // the download manager is launched only if nothing is being downloaded
		// Extract the playlist available in the player
		fs.readdir(playlistsPath, function(err,files){
			if (err){
				console.log("=> Error the playlistPath cannot be reach "+ err);
				return;
			}
			files = files.filter(function(file) { if ((path.extname(file) === ".pl")&&(path.basename(file,'.pl') != "main")) return file});
			if (files != undefined){
				checkPlaylists(files);
			}
		});	
	}
};
*/
var checkPlaylists = function(files){
	// Launch the download of the first missing media
	files.forEach(function(file) {
		fs.readFile(playlistsPath+file, function (err, data) {
		  if (err){
			  console.log("=> check playlists failed : "+ file);
		  }
		  var playlistObj = JSON.parse (data);	
		  var medias = playlistObj.medias;
		  if (medias != undefined){
			medias.forEach(function(media){
				// Check if the media is downloaded
				fs.open(mediasPath+media, "r", function(err, fd) {
					if(err){
						console.log("=> new media : "+ media.name +" needed for playlist : "+playlistObj.name);
						
						//TODO Download
						downloadMedia(media.link);
						download = false;
					}
				});
			});
		  }
	  });
	});
	
}



// download the desired media
var downloadMedia = function (url){
	
	
	
};
// remove the desired media 
var removeMedia = function(name){
	
};

/*
// DEVICE INFORMATION GENERATOR
*/
var deviceInformation = function (){
  
  var deviceData =  {name: _mac, temp: _temp, localip: _ip , memory: _mem};
  var jsonDevice = JSON.stringify(deviceData);
  httpPost(jsonDevice,'/online/devices/'+_mac);
  getMemory();
  getIPAddress();
  getTemperature();
}

/*
/ GET MEMORY INFORMATION
*/
function getMemory() {
 var child = exec('free -o -h',
	  function (error, stdout, stderr) {
		if (error !== null) {
		  console.log('=> error: memory run only on PI2');
		}else{
			_mem = stdout;
		}
	});
}

/*
/ GET IP LOCAL ADRESS
*/
function getIPAddress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        _ip =  alias.address;
    }
  }
}
/*
/ GET TEMPERATURE
*/
function getTemperature() {
  var child = exec('vcgencmd measure_temp',
	  function (error, stdout, stderr) {
		if (error !== null) {
		  console.log('=> error: temperature run only on PI2');
		}else{
			_temp = stdout.substring(5); // just get the temperature
		}
	});
}

function getMac(){
	var object = require('os').networkInterfaces();
	if (object.eth0 != undefined){
		var stringTemp = object.eth0[0].mac;
		stringTemp = stringTemp.substring(0, 5);
		stringTemp = stringTemp.replace(':','');
		_mac = stringTemp;
		console.log('=>Mac Adress information '+ _mac);
	}else{
		console.log('=> error: mac adress only works on linux system');
		_mac = 'UNDE';
	}
	return _mac;
}

/*
/  Main function to be call whenever sending Json to the server
*/
function httpPost(codestring, path) {
	
	// Build the post string from an object
	var post_data = '{"string": '+codestring+'}';
	// An object of options to indicate where to post to
	var post_options = {
	  host: serverIp,
	  //port: serverPortSSL,
	  path: path,
	  method: 'POST',
	  headers: {
		  'Content-Type': 'application/json',
	  }
	};
	// Set up the request
	var post_req = http.request(post_options, function(res) {
		 //console.log('>HTTP STATUS: ' + res.statusCode);
	});
	post_req.on('error', function(e) {
		console.error("=> Error when posting device information on the server : " + e);
	});
	// post the data
	post_req.write(post_data);
	post_req.end();
}

setInterval(deviceInformation, 10000);
//setInterval(downloadManager, 10000);
setInterval(updatePlaylist, 10000);


