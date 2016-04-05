var http = require("http");
var querystring = require('querystring');
var fs = require("fs");
var path = require('path');
var exec = require('child_process').exec;
var shortid = require('shortid');

var server = "http://arcane-oasis-9800.herokuapp.com";  // SERVER URL
var serverIp   = 'arcane-oasis-9800.herokuapp.com';


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

updatePlaylist();
