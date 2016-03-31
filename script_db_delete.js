var pg = require('pg');
var connectionString = 'postgres://fhaffwscrcrbqk:szPm6qahfBVt9caoCT9LspKavB@ec2-54-197-241-24.compute-1.amazonaws.com:5432/d59390etfcghc7?ssl=true';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('DROP TABLE devices');
query.on('end', function() { client.end(); });

var client2 = new pg.Client(connectionString);
client2.connect();
var query = client2.query('DROP TABLE tags');
query.on('end', function() { client2.end(); });

var client3 = new pg.Client(connectionString);
client3.connect();
var query = client3.query('DROP TABLE device_tag');
query.on('end', function() { client3.end(); });



var client4 = new pg.Client(connectionString);
client4.connect();
var query = client4.query('DROP TABLE medias');
query.on('end', function() { client4.end(); });


var client6 = new pg.Client(connectionString);
client6.connect();
var query = client6.query('DROP TABLE broadcasts');
query.on('end', function() { client6.end(); });


var client7 = new pg.Client(connectionString);
client7.connect();
var query = client7.query('DROP TABLE broadcast_tag');
query.on('end', function() { client7.end(); });


var client8 = new pg.Client(connectionString);
client8.connect();
var query = client8.query('DROP TABLE broadcast_media');
query.on('end', function() { client8.end(); });

var client9 = new pg.Client(connectionString);
client9.connect();
var query = client9.query('DROP TABLE broadcast_devices');
query.on('end', function() { client9.end(); });

var client10 = new pg.Client(connectionString);
client10.connect();
var query = client10.query('DROP TABLE events');
query.on('end', function() { client10.end(); });