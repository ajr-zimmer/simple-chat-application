// shorthand for $(document).ready(...)
$(function() {
  var client = io();

  //setCookie("username", "");
  //setCookie("usercolour", "");

  client.on('connect', function(){
    console.log("Connected: "+ client.id);
    client.emit('new user', getCookie("username"), getCookie("usercolour"));
  });

  client.on('connection welcome', function(users, colours, id){
    if(id === client.id){
      $('#welcome').html(function(){
        var uname = "<span style='color: " + colours[client.id] + ";'>" + users[client.id] + "</span>";
        return  "Welcome, " + uname + "!";
      });
    }
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
      } else if (isNameChange(message)){
        client.emit('name change', message);
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

  client.on('update name', function(newName){
    setCookie("username", newName);
  });

  client.on('update colour', function(newColour){
    setCookie("usercolour", newColour);
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

function isNameChange(msg){
  var reg = new RegExp('(\/nick) (.*)');
  var result = reg.exec(msg);
  if(result && (result[1] === "/nick")){
    return true;
  }
  return false;
}

function setCookie(name, value){
  document.cookie = name + "=" + value;
  console.log(document.cookie);
}

//http://stackoverflow.com/questions/5142337/read-a-javascript-cookie-by-name
function getCookie(name){
  var cookiestring = RegExp("" + name + "[^;]+").exec(document.cookie);
  return unescape(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./,"") : "");
}
