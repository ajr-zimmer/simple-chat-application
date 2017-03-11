// shorthand for $(document).ready(...)
$(function() {
  var client = io();

  client.on('connect', function(){
    console.log("Connected: "+ client.id);
    client.emit('new user');
  });

  client.on('connection welcome', function(users, colours, id){
    if(id === client.id){
      $('#welcome').html(function(){
        var uname = "<span style='color: " + colours[client.id] + ";'>" + users[client.id] + "</span>";
        return  "Welcome, " + uname + "!";
      });
    }
    //$('#messages').append($('<li>').html($('<em>').text("You are " + username + ", welcome!")));
  });

  client.on('update users', function(users, colours){
    $('#usernames').empty();
    $.each(users, function(clientId, username){
      $('#usernames').append($('<li>').html(function(){
        return "<span style='color: " + colours[clientId] + ";'>" + users[clientId] + "</span>";
      }));
    });
  });

  $('form').submit(function(){
    var chatLog = $('#messagesWrap');
    chatLog.animate({scrollTop: chatLog.prop('scrollHeight')}, 250);
    var message = $('#m').val();
    if(isNonEmptyString(message)){
      if(isColourChange(message)){
        client.emit('colour change', message);
      } else {
        client.emit('send message', message);
      }
      $('#m').val('');
    }
    return false;
  });

  client.on('display message', function(msg){
    generateMessageHtml(client.id, msg);
    if(msg.id === client.id){
      //client.emit('update chatlog', {id: msg.id, colour: msg.colour, text: $('#messages li').last().text()});
      // add only one message per client, otherwise we get duplicates
      client.emit('update chatlog', msg);
    }
  });

  client.on('refresh chatlog', function(logHistory){
    $('#messages').empty();
    for(let i=0; i<logHistory.length; i++){
      generateMessageHtml(client.id, logHistory[i]);
    }
  });

  /*client.on('invalid colour', function(id){
    if(id === client.id){
      $('#m').html(function(){
        var error = "<span style='color: red;'>" + data.username + "</span>";
        return data.timestamp +" "+ uname + ": " + data.message;
      }));
    }
  });*/

});

function generateMessageHtml(id, data){
  if(data.id === id){
    //$('#messages').append($('<li>').html($('<strong>').text(msg.timestamp + " " + msg.username + ": " + msg.message)));
    $('#messages').append($('<li>').html(function(){
      var uname = "<span style='color: " + data.colour + ";'>" + data.username + "</span>";
      return "<strong>" + data.timestamp +" "+ uname + ": " + data.message+"</strong>";
    }));
  } else {
    $('#messages').append($('<li>').html(function(){
      var uname = "<span style='color: " + data.colour + ";'>" + data.username + "</span>";
      return data.timestamp +" "+ uname + ": " + data.message;
    }));
  }
}

function isNonEmptyString(str){
  if(str !== ""){
    return true;
  } else {
    return false;
  }
}


function isColourChange(msg){
  var reg = new RegExp('(\/nickcolor) (.*)');
  var result = reg.exec(msg);
  if(result && (result[1] === "/nickcolor")){
    return true;
  }
  return false;
}
