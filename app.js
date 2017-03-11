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
var counter = 0;
var colours = {};

var messageLogHistory = [];

io.on('connection', function(client) {

  //console.log(socket.request.headers.cookie);

  client.on('new user', function(uname, ucolour){
    console.log('a user connected with id:' + client.id);
    if(!uname){
      uname = "User"+counter;
      counter +=1;
    }
    if(!ucolour){
      ucolour = "#000000";
    }
    users[client.id] = uname;
    colours[client.id] = ucolour;
    io.emit('update name', uname);
    io.emit('update colour', ucolour);
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
          var newColour = colourObj.hex;
          colours[client.id] = newColour;
          console.log(colours[client.id]);
          io.emit('update colour', newColour);
          io.emit('connection welcome', users, colours, client.id);
          io.emit('update users', users, colours);
        } else {
          console.log("ERROR: INVALID COLOUR VALUE");
          //io.emit('invalid colour', client.id);
        }
      }
    });

    client.on('name change', function(msg){
      var reg = new RegExp('(\/nick) (.*)');
      var result = reg.exec(msg);
      if(result && (result[1] === "/nick")){
        var newName = result[2];
        // add logic to check for uniqueness
        if(newName && (isNameUnique(newName))){
          users[client.id] = newName;
          console.log("New name: " + users[client.id]);
          io.emit('update name', newName);
          io.emit('connection welcome', users, colours, client.id);
          io.emit('update users', users, colours);
        } else {
          console.log("ERROR: NAME ALREADY TAKEN || NAME CANNOT BE EMPTY STRING");
          //io.emit('invalid name', client.id);
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


function isNameUnique(newName){
  for(user in users){
    if(users[user] === newName){
      return false;
    }
  }
  return true;
}
