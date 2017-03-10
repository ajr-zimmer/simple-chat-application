var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

/**
 * Get port from environment and store in Express.
 */

var port = '3000';
app.set('port', port);

/**
 * Listen on provided port, on all network interfaces.
 */

 io.on('connection', function(socket){
   console.log('a user connected');
   socket.on('disconnect', function(){
     console.log('user disconnected');
   });
   socket.on('chat message', function(msg){
     console.log('message: ' + msg);
     io.emit('chat message', msg);
   });
 });

 server.listen(3000, function(){
   console.log('listening on port: '+ port);
 });

app.use(express.static(__dirname + '/public'));

// *** routes *** //
var routes = require('./routes/index.js');

// *** main routes *** //
app.use('/', routes);
