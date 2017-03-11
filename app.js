var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var moment = require('moment');
var parseColour = require('parse-color');

moment().format();

app.use(express.static(__dirname + '/public'));

var port = '3000';
app.set('port', port);

var users = {};
var namesUsed = [];
var counter = 0;
var colours = {};

var messageLogHistory = [];

io.on('connection', function(client) {

  client.on('new user', function(){
    console.log('a user connected with id:' + client.id);
    var username = "User"+counter;
    users[client.id] = username;
    counter +=1;
    colours[client.id] = "#000000";
    io.emit('connection welcome', users, colours, client.id);
    io.emit('update users', users, colours);
    io.emit('refresh chatlog', messageLogHistory);
  });

    // When client sends a message, broadcast to everyone
    client.on('send message', function(msg) {
        console.log('message: ' + msg);

        var message = {
          id: client.id,
          username: users[client.id],
          colour: colours[client.id],
          message: msg,
          timestamp: moment().format("MMM/DD/YYYY - kk:mm")
        };

        io.emit('display message', message);
    });

    client.on('colour change', function(msg){
      var reg = new RegExp('(\/nickcolor) (.*)');
      var result = reg.exec(msg);
      if(result && (result[1] === "/nickcolor")){
        var colourObj = parseColour(result[2]);
        if(colourObj.hex){
          colours[client.id] = colourObj.hex;
          console.log(colours[client.id]);
          io.emit('connection welcome', users, colours, client.id);
          io.emit('update users', users, colours);
        } else {
          console.log("ERRRR NO, INVALID VALUE!");
          //io.emit('invalid colour', client.id);
        }
      }
    });

    client.on('update chatlog', function(lastMsg){
      messageLogHistory.push(lastMsg);
      if(messageLogHistory.length > 10){
        messageLogHistory = messageLogHistory.slice(-10);
      }
      io.emit('refresh chatlog', messageLogHistory);
    });

    client.on('disconnect', function() {
        console.log('user disconnected with id:' + client.id);
        delete users[client.id];
        delete colours[client.id];
        io.emit('update users', users);
    });
});

server.listen(3000, function() {
    console.log('listening on port: ' + app.get('port'));
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});
