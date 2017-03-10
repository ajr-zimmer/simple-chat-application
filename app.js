var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = '3000';
app.set('port', port);

io.on('connection', function(client) {
    console.log('a user connected');
    client.on('disconnect', function() {
        console.log('user disconnected');
    });
    // When client sends a message, broadcast to everyone
    client.on('send message', function(msg) {
        console.log('message: ' + msg);
        io.emit('display message', msg);
    });
});

server.listen(3000, function() {
    console.log('listening on port: ' + app.get('port'));
});

// Used for serving static files
app.use(express.static(__dirname + '/public'));

// *** routes *** //
var routes = require('./routes/index.js');

// *** main routes *** //
app.use('/', routes);
