var pg = require('pg');
var connectionString = 'postgres://fhaffwscrcrbqk:szPm6qahfBVt9caoCT9LspKavB@ec2-54-197-241-24.compute-1.amazonaws.com:5432/d59390etfcghc7?ssl=true';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('CREATE TABLE devices(id SERIAL PRIMARY KEY, name VARCHAR(20) not null,temperature VARCHAR(10),localip VARCHAR(30),lastseen VARCHAR(25),created VARCHAR(25),owner INT,description VARCHAR(100),memory VARCHAR(500))');
query.on('end', function() { client.end(); });

var client2 = new pg.Client(connectionString);
client2.connect();
var query = client2.query('CREATE TABLE tags(id SERIAL PRIMARY KEY, name VARCHAR(20) not null)');
query.on('end', function() { client2.end(); });

var client3 = new pg.Client(connectionString);
client3.connect();
var query = client3.query('CREATE TABLE device_tag(id SERIAL PRIMARY KEY, id_device INT not null, id_tag INT not null, selected BOOLEAN)');
query.on('end', function() { client3.end(); });


var client4 = new pg.Client(connectionString);
client4.connect();
var query = client4.query('CREATE TABLE medias (id SERIAL PRIMARY KEY, name VARCHAR(40) not null,ftplink VARCHAR(250) not null,owner INT,sha1 VARCHAR(250),created VARCHAR(25), size INT, type VARCHAR(25) )');
query.on('end', function() { client4.end(); });

var client5 = new pg.Client(connectionString);
client5.connect();
var query = client5.query('CREATE TABLE mediatypes (id SERIAL PRIMARY KEY, name VARCHAR(100) not null)');
query.on('end', function() { client5.end(); });

var client6 = new pg.Client(connectionString);
client6.connect();
var query = client6.query('CREATE TABLE broadcasts (id SERIAL PRIMARY KEY, name VARCHAR(100) not null,version VARCHAR(100), datefrom VARCHAR(25),dateto VARCHAR(25),created VARCHAR(25),broadcasted BOOLEAN,owner INT)');
query.on('end', function() { client6.end(); });


var client7 = new pg.Client(connectionString);
client7.connect();
var query = client7.query('CREATE TABLE broadcast_tag (id SERIAL PRIMARY KEY, id_broadcast INT not null, id_tag INT not null, selected BOOLEAN)');
query.on('end', function() { client7.end(); });


var client8 = new pg.Client(connectionString);
client8.connect();
var query = client8.query('CREATE TABLE broadcast_media (id SERIAL PRIMARY KEY, id_broadcast INT not null, id_media INT not null, selected BOOLEAN)');
query.on('end', function() { client8.end(); });

var client9 = new pg.Client(connectionString);
client9.connect();
var query = client9.query('CREATE TABLE broadcast_devices (id SERIAL PRIMARY KEY, id_broadcast VARCHAR(40) not null, id_device INT not null, updated BOOLEAN)');
query.on('end', function() { client9.end(); });

var client10 = new pg.Client(connectionString);
client10.connect();
var query = client10.query('CREATE TABLE events(id SERIAL PRIMARY KEY, device_name VARCHAR(20) not null,type VARCHAR(40), event VARCHAR(500),broadcast VARCHAR(40),date VARCHAR(25),media VARCHAR(25))');
query.on('end', function() { client.end(); });
