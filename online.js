var express = require('express');
var bodyParser = require('body-parser');
var pg = require ('pg');
var fs = require ('fs');
var app = express();
var Client = require('ftp');

var mock = 0;

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json()); // for parsing application/json
app.use(express.static('public'));

var connectionString = process.env.HEROKU_POSTGRESQL_COPPER_URL || 'postgres://fhaffwscrcrbqk:szPm6qahfBVt9caoCT9LspKavB@ec2-54-197-241-24.compute-1.amazonaws.com:5432/d59390etfcghc7?ssl=true';
//update the media list and store it in the database
var connectionProperties = {host: "online.royalwebhosting.net",user: "1942016",password: "hellmaster"};
var ftpresult = [];

app.get("/online",function(req,res){
	res.sendfile("./public/htm/online.html");
});

app.get("/online/ftp/listing",function(req,res){
	console.log("GET > retrieving medias on the FTP account");
	
});

function UpdateFtpMedias(){
	console.log("FTP > retrieving medias on the FTP account");
	var result = [];
	var c = new Client();
	
	console.log('FTP > size of the current list '+ ftpresult.length);
	// Clear the current ftpresult
	for (var i=0; i < ftpresult.length ; i++){
		ftpresult.pop();
	}
	console.log('FTP > removing all elements '+ ftpresult.length);
	c.on('ready', function () {
    console.log('FTP > ready');
		c.list('/online.royalwebhosting.net',function (err, list) {
			if (err){
				console.error('>FTP : connection error  ' + err);
				return;
			};
			list.forEach(function (element, index, array) {
				//Ignore directories
				if (element.type === 'd') {
					console.log('>FTP : ignoring directory ' + element.name);
					return;
				}
				console.log('>FTP : detecting an element ' + element.name);
				ftpresult.push(element);
			});
		});
	});
	c.on('error', function (err) {
		console.error('>FTP : connection error  ' + err);
	});
	c.connect(connectionProperties);	
};

/*
GET FUNCTION : send back the information of all players registered online
*/
app.get("/online/devices",function(req,res){
	console.log("GET > retrieving devices");
	

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
		if (client != null){
		client.query("SELECT * FROM devices ORDER BY id ASC;", function(err, result) {
			//call `done()` to release the client back to the pool
			done();
			if(err) {
			  return console.error('> Error running update', err);
			}

			return res.json(result.rows);
		});
			
    }});
	
});

/*
GET FUNCTION : send all the tags registered online
*/
app.get("/online/tags",function(req,res){
	console.log('GET> retrieving the tags');
	var results = [];

	pg.connect(connectionString, function(err, client, done) {
		if (client != null){
		client.query("SELECT * FROM tags;", function(err, result) {
			//call `done()` to release the client back to the pool
			done();
			if(err) {
			  return console.error('> Error running update', err);
			}
			return res.json(result.rows);
		});
			
    }});
});


/*
GET FUNCTION : send all the type of media supported by the platform
TO DO : send only the one supported by the device 
*/
app.get("/online/medias/types",function(req,res){
	console.log('GET> retrieving media types');
	var results = [];

	pg.connect(connectionString, function(err, client, done) {
		if (client != null){
		client.query("SELECT * FROM mediatypes;", function(err, result) {
			//call `done()` to release the client back to the pool
			done();
			if(err) {
			  return console.error('> Error fetching media types', err);
			}
			return res.json(result.rows);
		});
			
    }});
});

/*
GET FUNCTION : send all the medias availables online
*/
app.get("/online/medias",function(req,res){
	console.log("GET > retrieving medias");
	
	var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
		if (client != null){
		client.query("SELECT * FROM medias ORDER BY id ASC;", function(err, result) {
			//call `done()` to release the client back to the pool
			done();
			if(err) {
			  return console.error('> Error running update', err);
			}
			
			return res.json(result.rows);
		});
			
    }});
	
});

/*
POST FUNCTION : remove the medias from the list
*/
app.post("/online/medias/r/",function(req,res){
	var data = req.body;
	var id = data.string.id || null;
	
	if( id != null){
		
		pg.connect(connectionString, function(err, client, done) {
			if (client != null){
				console.log("> Remove media "+ id);
				client.query("DELETE FROM medias WHERE id=($1)", [id], function(err, result){
				done();
					if(err) {
					  return console.error('> Error running update', err);
					}
				res.sendStatus(200);
				});
			}
		});
	}else{
		res.sendStatus(500);
	}
});

/*
POST FUNCTION : UPDATE / CREATE an media
*/
app.post('/online/medias/:ID', function(req, res) {
	var data = req.body;
	
	var name = data.string.name || null;
	var ftplink = data.string.ftplink || null;
	var owner = '1';//TODO, data.string.owner || null;
	var date = new Date().toISOString();
	var tags = data.string.tags || null;
	var sha1 = data.string.sha1 || null;
	var type = data.string.type || null;
	var id = data.string.id || null;
	
	
	console.log('POST> the media : '+req.params.ID+ ' is sending information| ');
	
	
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
		if (client != null){
			console.log("> Trying to updating an existing media "+ name);
		    client.query("UPDATE medias SET name=coalesce(($1),name), ftplink=coalesce(($2),ftplink), owner =coalesce(($3),owner),type =coalesce(($4),type) WHERE id=($5)", [name,ftplink,owner,type,id], function(err, result) {
			//call `done()` to release the client back to the pool
			done();
			if(err) {
			  return console.error('> Error running update', err);
			}
			if (result.rowCount !=  0) res.sendStatus(200);
			if (result.rowCount ==  0){
				   
				   console.log("> Insert a new media");
				   client.query("INSERT INTO medias(name,ftplink,owner,sha1,created,type) values($1,$2,$3,$4,$5,$6)", [name,ftplink,owner,sha1,date,type], function(err, result) {
				   res.sendStatus(200);
				   // INSERT INTO ANY BROADCAST THE POSSIBILITY TO SELECT THIS NEW MEDIA	   
					var currentIndex = null;
					
					client.query("SELECT MAX(id) FROM medias", function(err, result) {
						currentIndex=result.rows[0].max;
						done();
						if(err) {
						  return console.error('> Error running insert', err);
						}
					});
					client.query("SELECT * FROM broadcasts", function(err, result) {
						if (result != null){
							for (var i=0; i < result.rows.length;i++){
								client.query("INSERT INTO broadcast_media(id_broadcast,id_media) values($1,$2)", [result.rows[i].id,currentIndex], function(err, subresult) {
										done();
										if(err) {
										  return console.error('> Error running insert', err);
										}
								});
								done();
								if(err) {
								  return console.error('> Error running insert', err);
								}
							}
					}
					});
			
					//call `done()` to release the client back to the pool
					done();
					if(err) {
					  return console.error('> Error running insert', err);
					}
					//output: 1
				  });
				  return ;
			}
			
			//output: 1
		  });
    }});
});

/*
GET FUNCTION : send all broadcasts availables
*/
app.get("/online/broadcasts",function(req,res){
	//TODO broadcast storage
	console.log("GET > retrieving broadcasts");
	var results = [];

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
		if (client != null){
		client.query("SELECT * FROM broadcasts ORDER BY id ASC;", function(err, result) {
			//call `done()` to release the client back to the pool
			done();
			if(err) {
			  return console.error('> Error running broadcasts update', err);
			}
			
			return res.json(result.rows);
		});
			
    }});
});

/*
POST FUNCTION : REMOVE a broadcast an dependencies to devices from the list
*/
app.post("/online/broadcasts/r/",function(req,res){
	var data = req.body;
	var id = data.string.id || null;
	
	if( id != null){
		pg.connect(connectionString, function(err, client, done) {
			if (client != null){
				console.log("> Remove broadcast "+ id);
					client.query("DELETE FROM broadcasts WHERE id=($1)", [id], function(err, result){
					done();
					if(err) {
					  return console.error('> Error running media delete', err);
					}else{
						client.query("DELETE FROM broadcast_devices WHERE (id_broadcast=($1))",[id], function(err, result) {
						done();
						if(err) {
						  return console.error('> Error running media delete', err);
						}
						res.sendStatus(200);
						});
						}
					});
				}
			});
	}else{
		res.sendStatus(500);
	}
});

app.post('/online/broadcasts/:ID', function(req, res) {
	var data = req.body;
	
	var name = data.string.name || null;
	var datefrom = data.string.datefrom || null;
	var dateto = data.string.dateto || null;
	var date = new Date().toISOString();
	var tags = data.string.tags || null;
	var owner = data.string.owner || null;
	var medias = data.string.medias || null;
	var id = data.string.id || null;
	var broadcasted = data.string.broadcasted;
	
	
	console.log('POST> the broadcast : '+broadcasted+id+' / '+ name +' is sending information| ');
	
	
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
		if (client != null){
			console.log("> Trying to updating an existing broadcast "+ name);
		    client.query("UPDATE broadcasts SET name=coalesce(($1),name), datefrom=coalesce(($2),datefrom), dateto =coalesce(($3),dateto),owner =coalesce(($4),owner), broadcasted=($5) WHERE id=($6)", [name,datefrom,dateto,owner,broadcasted,id], function(err, result) {
			// UPDATE ALL DEPENDANCIES TO TAGS
			if (tags != null){
				for (var i = 0; i < tags.length ; i++){
					//console.log("UPDATING : " + tags[i].selected + " "+tags[i].id_tag);
					client.query("UPDATE broadcast_tag SET selected=($1) WHERE (id_broadcast=($2) AND id_tag=($3))", [tags[i].selected,id,tags[i].id_tag], function(err, result) {
					done();
					if(err) {
					  return console.error('> Error running update', err);
					}
				  });
				}
			}
			// UPDATE ALL DEPENDANCIES TO MEDIAS
			if (medias != null){
				for (var i = 0; i < medias.length ; i++){
					//console.log("UPDATING : " + medias[i].selected + " "+medias[i].id_media);
					client.query("UPDATE broadcast_media SET selected=($1) WHERE (id_broadcast=($2) AND id_media=($3))", [medias[i].selected,id,medias[i].id_media], function(err, result) {
					done();
					if(err) {
					  return console.error('> Error running update', err);
					}
				  });
				}
			}
			
			// UPDATE ALL DEPENDANCIES TO DEVICES
			if (tags != null){
				console.log("> SQL Trying to updating the broadcast devices list ");	
				
				// Clear the list for this  broadcast
				client.query("DELETE FROM broadcast_devices WHERE (id_broadcast=($1))",[id], function(err, result) {
				done();
				if(err) {
				  return console.error('> Error running update', err);
				}else{
					console.log("> SQL  inserting devices list ");
					// Generate the IN clause string
					var inclause="";	
					for (var i = 0; i < tags.length ; i++){
						if (tags[i].selected){
							inclause += tags[i].id_tag+",";
						}
					}
					inclause=inclause.slice(0, -1);
					
					
					// Identify the devices impacted, and reset their status
					var commandUpdate = "UPDATE broadcast_devices SET updated=false WHERE id_device IN (SELECT devices.id FROM devices INNER JOIN device_tag ON devices.id = device_tag.id_device WHERE (device_tag.selected AND device_tag.id IN ("+inclause+")))";
					client.query(commandUpdate, function(err, result) {
					done();
						if(err) {
							return console.error('> Error running update', err);
						}else{
							//Get the distinct devices id that match the group of tags and insert them
							var command ="INSERT INTO broadcast_devices (id_broadcast,updated,id_device) SELECT DISTINCT CAST( "+id+" as INT),false,devices.id FROM devices INNER JOIN device_tag ON devices.id = device_tag.id_device WHERE (device_tag.selected AND device_tag.id IN ("+inclause+"))";
							client.query(command, function(err, result) {
							done();
							if(err) {
							  return console.error('> Error running update', err);
							}
							});
						}
					});
					
					
				}
			  });
			}
			
			
			//call `done()` to release the client back to the pool
			done();
			if(err) {
			  return console.error('> Error running update', err);
			}
			if (result.rowCount !=  0)res.sendStatus(200);
			if (result.rowCount ==  0){
				  console.log("> Insert a new broadcast");
				  client.query("INSERT INTO broadcasts(name,datefrom,dateto,owner,created,broadcasted) values($1,$2,$3,$4,$5,$6)", [name,datefrom,dateto,owner,date,broadcasted], function(err, result) {
					  
				 
				  // INSERT ALL THE DEPENDENCIES TO MEDIAS
				  // INSERT INTO ANY BROADCAST THE POSSIBILITY TO SELECT ALL THE MEDIAS
					var currentIndex = null;

					client.query("SELECT MAX(id) FROM broadcasts", function(err, result) {
						currentIndex=result.rows[0].max;
						done();
						if(err) {
						  return console.error('> Error running insert', err);
						}
					});
				  
					client.query("SELECT * FROM medias", function(err, result) {
						if(result != null){
							for (var i=0; i < result.rows.length;i++){
								client.query("INSERT INTO broadcast_media(id_broadcast,id_media) values($1,$2)", [currentIndex,result.rows[i].id], function(err, subresult) {
										done();
										if(err) {
										  return console.error('> Error running insert', err);
										}
								});
							done();
								if(err) {
								  return console.error('> Error running insert', err);
								}
							}
						}
					});
					
					// INSERT ALL THE POSSIBLE TAGS
					client.query("SELECT * FROM tags", function(err, result) {
						if(result != null){
							for (var i=0; i < result.rows.length;i++){
								client.query("INSERT INTO broadcast_tag(id_broadcast,id_tag) values($1,$2)", [currentIndex,result.rows[i].id], function(err, subresult) {
										done();
										if(err) {
										  return console.error('> Error running insert', err);
										}
								});
							done();
								if(err) {
								  return console.error('> Error running insert', err);
								}
							}
						}
					});				 
					 
					 
					//call `done()` to release the client back to the pool
					done();
					res.sendStatus(200);
					if(err) {
					  return console.error('> Error running insert', err);
					}
					
					//output: 1
				  });
				  return ;
			}
			//output: 1
		  });
    }});
});

app.get("/online/broadcasts/:PLAYER",function(req,res){
	console.log("GET >  checking if a new main playlist is available for "+req.params.PLAYER);

	var name = req.params.PLAYER;
	
	if (name != ""){
	// Build the core playlist for the concerned device
	pg.connect(connectionString, function(err, client, done) {
		if (client != null){
			console.log("> Retrieve broadcast ID that are eligible to display "+name );
			client.query("SELECT id_broadcast,updated FROM broadcast_devices INNER JOIN devices ON broadcast_devices.id_device = devices.id WHERE (devices.name=($1) AND broadcast_devices.updated = false AND (SELECT broadcasts.broadcasted FROM broadcasts WHERE broadcasts.id = broadcast_devices.id_broadcast) = true)",[name], function(err, result) {
			//client.query("SELECT id_broadcast,updated FROM broadcast_devices INNER JOIN devices ON broadcast_devices.id_device = devices.id WHERE (devices.name=($1) AND (SELECT broadcasts.broadcasted FROM broadcasts WHERE broadcasts.id = broadcast_devices.id_broadcast) = true)",[name], function(err, result) {
			
			done();
			if(err) {
			  return console.error('> Error getting the main playlist', err);
			}else{
				if (result.rows.length == 0) return res.sendStatus(404);
				// Generate a playlist and send it to the player
				// Generate the IN clause string
				var inclause="";	
				for (var i = 0; i < result.rows.length ; i++){
					inclause += result.rows[i].id_broadcast+",";
				}
				inclause=inclause.slice(0, -1);
				console.log("> Retrieving the package of playlist : "+inclause);
				var command = "SELECT broadcasts.id, broadcasts.name, broadcasts.datefrom, broadcasts.dateto , medias.ftplink FROM broadcasts JOIN broadcast_media ON broadcast_media.id_broadcast = broadcasts.id JOIN medias ON medias.id = broadcast_media.id_media WHERE broadcast_media.selected = true AND broadcasts.id  IN ("+inclause+")";
				client.query(command, function(err, resultBroadcast) {
				//call `done()` to release the client back to the pool
				done();
				if(err) {
				  return console.error('> Error getting the main playlist', err);
				}else{
					var myJson = {'name':'value'};
					// Reorganize the JSON to make it simplified
					var temp = resultBroadcast.rows.slice();
					var broadcasts = [];
					var previousId=-1;
					console.log("size  "+ resultBroadcast.rows.length );
					for(var i=0; i < resultBroadcast.rows.length ; i++){
						var id = resultBroadcast.rows[i].id;
						// ignore repetitive lines
						if (previousId == id){
							delete resultBroadcast.rows[i]; 
						}else{
							previousId = id;
							//console.log("reading id: "+id);
							var mediaarray=[];
							for(var j=0; j < temp.length ; j++){
								if (temp[j].id == id){
									mediaarray.push(temp[j].ftplink);
								}
							}
							resultBroadcast.rows[i].medias = mediaarray;
							broadcasts.push(resultBroadcast.rows[i]);
						}
						
					}
						
					
					res.send(broadcasts);
					
					command = "UPDATE broadcast_devices SET updated=true WHERE id_broadcast IN ("+inclause+")";
					client.query(command, function(err, result) {
					done();
					if(err) {
						return console.error('> Error updating the broadcasted status update', err);
					}
					});
					
				}
				});
			}
			});
		}
	});	
	}
});


app.get("/online/broadcasts/:ID/tags",function(req,res){
	console.log('GET> the broadcast : '+ req.params.ID + ' is requesting tags');
	
	var results = [];

	pg.connect(connectionString, function(err, client, done) {
		if (client != null){
		client.query("SELECT id_tag,name,selected FROM broadcast_tag INNER JOIN tags ON broadcast_tag.id_tag = tags.id WHERE id_broadcast=$1;",[req.params.ID], function(err, result) {
			//call `done()` to release the client back to the pool
			done();
			if(err) {
			  return console.error('> Error running update', err);
			}
		
			return res.json(result.rows);
		});
			
    }});
});

app.get("/online/broadcasts/:ID/medias",function(req,res){
	console.log('GET> the broadcast : '+ req.params.ID + ' is requesting medias');
	
	var results = [];

	pg.connect(connectionString, function(err, client, done) {
		if (client != null){
		client.query("SELECT id_media,name,selected FROM broadcast_media INNER JOIN medias ON broadcast_media.id_media = medias.id WHERE id_broadcast=$1;",[req.params.ID], function(err, result) {
			//call `done()` to release the client back to the pool
			done();
			if(err) {
			  return console.error('> Error running update', err);
			}
		
			return res.json(result.rows);
		});
			
    }});
});

app.post('/online/devices/:ID', function(req, res) {
	var data = req.body;
	
	var temp = data.string.temp || null;
	var localip = data.string.localip || null;
	var name = data.string.name || null;
	var description = data.string.description || null;
	var owner = parseInt(data.string.owner) || null;
	var date = new Date().toISOString();
	var tags = data.string.tags || null;
	var memory = data.string.memory || null;
	var id = data.string.id || null;
	
	console.log('POST> the player : '+req.params.ID+ ' is sending status information | ' + localip + ' | '+ temp + ' | '+ name);
	res.sendStatus(200);
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
		if (client != null){
		    client.query("UPDATE devices SET temperature=coalesce(($1),temperature), localip=coalesce(($2),localip), lastseen =coalesce(($3),lastseen), description = coalesce(($4),description), owner = coalesce(($5),owner), memory = coalesce(($6),memory) WHERE name=($7)", [temp,localip,date,description,owner,memory,name], function(err, result) {
			// INSERT ALL DEPENDANCIES TO TAGS
			if (tags != null){
				for (var i = 0; i < tags.length ; i++){
					console.log("UPDATING : " + tags[i].selected + " "+tags[i].id_tag);
					client.query("UPDATE device_tag SET selected=($1) WHERE (id_device=($2) AND id_tag=($3))", [tags[i].selected,id,tags[i].id_tag], function(err, result) {
					done();
					if(err) {
					  return console.error('> Error running update', err);
					}
				  });
				}
			}
			//call `done()` to release the client back to the pool
			done();
			if(err) {
			  return console.error('> Error running update', err);
			}
			
			if (result.rowCount ==  0){
				    console.log("> Insert a new device");
				    client.query("INSERT INTO devices(name,localip,created) values($1,$2,$3)", [name,localip,date], function(err, result) {
					
					// INSERT ALL THE POSSIBLE TAGS
					var currentIndex = null;

					client.query("SELECT MAX(id) FROM devices", function(err, result) {
						currentIndex=result.rows[0].max;
						done();
						if(err) {
						  return console.error('> Error running insert', err);
						}
					});
				  
					client.query("SELECT * FROM tags", function(err, result) {
						if(result != null){
							for (var i=0; i < result.rows.length;i++){
								client.query("INSERT INTO device_tag(id_device,id_tag) values($1,$2)", [currentIndex,result.rows[i].id], function(err, subresult) {
										done();
										if(err) {
										  return console.error('> Error running insert', err);
										}
								});
							done();
								if(err) {
								  return console.error('> Error running insert', err);
								}
							}
						}
					});	
						
						
					//call `done()` to release the client back to the pool
					done();
					if(err) {
					  return console.error('> Error running insert', err);
					}
					//output: 1
				  });
				  return ;
			}
			//output: 1
		  });
    }});
});

app.get("/online/devices/:ID/tags",function(req,res){
	console.log('GET> the player : '+ req.params.ID + ' is requesting tags');
	
	var results = [];

	pg.connect(connectionString, function(err, client, done) {
		if (client != null){
		client.query("SELECT id_tag,name,selected FROM device_tag INNER JOIN tags ON device_tag.id_tag = tags.id WHERE id_device=$1;",[req.params.ID], function(err, result) {
			//call `done()` to release the client back to the pool
			done();
			if(err) {
			  return console.error('> Error running update', err);
			}
		
			return res.json(result.rows);
		});
			
    }});
});

var server = app.listen(app.get('port'), function () {

   console.log('Node app is running on port', app.get('port'));

});;

//setInterval(UpdateFtpMedias, 10000);

