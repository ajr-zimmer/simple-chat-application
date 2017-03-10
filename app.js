var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

var port = '3000';
app.set('port', port);

var users = {};
var namesUsed = [];
var counter = 0;

io.on('connection', function(client) {
    console.log('a user connected with id:' + client.id);
    users[client.id] = "User"+counter;
    counter +=1;
    io.emit('update users', users);

    // When client sends a message, broadcast to everyone
    client.on('send message', function(msg) {
        console.log('message: ' + msg);
        io.emit('display message', msg);
    });

    client.on('disconnect', function() {
        console.log('user disconnected with id:' + client.id);
        delete users[client.id];
        io.emit('update users', users);
    });
});

server.listen(3000, function() {
    console.log('listening on port: ' + app.get('port'));
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});
