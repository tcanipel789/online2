var pg = require('pg');
var connectionString = 'postgres://csvpsujaljamxy:gcjhDnpk7mFfLVhz7KbP0Qhy5w@ec2-50-19-208-138.compute-1.amazonaws.com:5432/d6dss85etufrmo?ssl=true';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('DELETE FROM devices');
query.on('end', function() { client.end(); });

var client3 = new pg.Client(connectionString);
client3.connect();
var query = client3.query('DELETE FROM device_tag');
query.on('end', function() { client3.end(); });



var client4 = new pg.Client(connectionString);
client4.connect();
var query = client4.query('DELETE FROM medias');
query.on('end', function() { client4.end(); });


var client6 = new pg.Client(connectionString);
client6.connect();
var query = client6.query('DELETE FROM broadcasts');
query.on('end', function() { client6.end(); });


var client7 = new pg.Client(connectionString);
client7.connect();
var query = client7.query('DELETE FROM broadcast_tag');
query.on('end', function() { client7.end(); });


var client8 = new pg.Client(connectionString);
client8.connect();
var query = client8.query('DELETE FROM broadcast_media');
query.on('end', function() { client8.end(); });
