var http = require("http");
var querystring = require('querystring');
var fs = require("fs");
var path = require('path');
var exec = require('child_process').exec;
var shortid = require('shortid');

var server = "http://arcane-oasis-9800.herokuapp.com";  // SERVER URL
/*
/ Functions to fetch every 10s if a new playlist is available
*/
var updatePlaylist = function(){
  http.get(server+"/online/broadcasts/b827eb11711", function(res) {
	  res.on("data",function (data){
			if (res.statusCode != 404){
				console.log("=> New playlist available");
				var playlistObj = JSON.parse(data);	
				console.log(playlistObj);
				var playlistName = shortid.generate();
				console.log(playlistName);
			}
  })}).on('error', function(e) {
	  console.log("=> Error when fetching the broadcast request : " + e.message);
	});
}
/*
 download a file and send feedback in callback, manage the error by itself, no action on the file
 should be done manually in competition with this function
*/
var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
	response.pipe(file);
	var marker=[0,0,0,0,0,0,0,0,0,0];
	var limitd = 0;
	var limitu = 9;
	var ind = 0;
	response.on('data', function() {
		try {
        var stats = fs.statSync(dest);
		//Convert the file size to megabytes
		var fileSizeInMegabytes = stats.size / 1000000.0;
		var done = Math.round((fileSizeInMegabytes / _size) * 100);
		// send events of download every 10%
		if (done > limitd && done < limitu){
			if(marker[ind] == 0){
				if (cb) cb(2,null,limitd); 
				marker[ind] = 1;
				limitd+=10;
				limitu+=10;
				ind+=1;
			}
		} 
		}
		catch (err) {
			if (cb) cb(null,"File > error"); 
			file.end();
		}
    });
	if (response.statusCode == 202){
		cb(3);
		return; // do not return a finish event
	}
	response.on('error', function() {
		if (cb) cb(null,err.message);
    });

    file.on('finish', function() {
      file.close(cb(1,null,dest));  // close() is async, call cb after close completes with finish status
    });
	file.on('error', function() {
     console.log("FILE error");
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(null,err.message);
  });
  
  request.setTimeout( 10000, function( ) {
	 try{
		 fs.unlink(dest); // Delete the file async. (But we don't check the result)
	 }catch(err){}
     console.log("=> lost connection to server");
	 request.abort();
  });
};

var _mac = "b827eb11711";
var _media = "6";
var _size = "1"; // in Mo

download(server+"/download", "test.h264", function(res,err,msg){
	var eventData =  {name: _mac, type: "media", event: "-",media: _media};
    if(res){
		if( res == 1){
			try {
				var stats = fs.statSync(msg);
				console.log("download finished ,total file size: "+stats.size);
				eventData.type = "media-data";
				eventData.event = 100;
				var jsonEvent = JSON.stringify(eventData);
				httpPost(jsonEvent,'/online/'+_mac+'/event');
			}
			catch (err) {
			}
		}
		if( res == 2){
			console.log("data event : "+msg);
			eventData.type = "media-data";
			eventData.event = msg;
			var jsonEvent = JSON.stringify(eventData);
			httpPost(jsonEvent,'/online/'+_mac+'/event');
		}
		if( res == 3){
			console.log("waiting a slot on the server ");
			eventData.event = "waiting a slot on the server ";
			var jsonEvent = JSON.stringify(eventData);
			httpPost(jsonEvent,'/online/'+_mac+'/event');
		}
	}
	if(err) {
		console.log(err);
		eventData.event = err;
		var jsonEvent = JSON.stringify(eventData);
		httpPost(jsonEvent,'/online/'+_mac+'/event');
	}
	
});




/*
/  Main function to be call whenever sending Json to the server
*/
var serverIp   = 'arcane-oasis-9800.herokuapp.com';
function httpPost(codestring, path) {
	
	// Build the post string from an object
	var post_data = '{"string": '+codestring+'}';
	// An object of options to indicate where to post to
	var post_options = {
	  host: serverIp,
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
		console.error("=> Error when posting event : " + e);
	});
	post_req.setTimeout( 10000, function( ) {
	 post_req.abort();
    });
	// post the data
	post_req.write(post_data);
	post_req.end();
}
