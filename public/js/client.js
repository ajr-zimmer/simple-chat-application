// shorthand for $(document).ready(...)
$(function() {
  var client = io();

  client.on('new user', function(username){
    $('#welcome').text("Welcome, " + username + "!");
  });

  client.on('update users', function(users){
    $('#usernames').empty();
    $.each(users, function(clientId, username){
      $('#usernames').append($('<li>').text(username));
    });
  });

  $('form').submit(function(){
    var chatLog = $('#messagesWrap');
    chatLog.animate({scrollTop: chatLog.prop('scrollHeight')}, 250);
    if(isNonEmptyString($('#m').val())){
      client.emit('send message', $('#m').val());
      $('#m').val('');
    }
    return false;
  });

  client.on('display message', function(msg){
    if(msg.id === client.id){
      $('#messages').append($('<li>').html($('<strong>').text(msg.timestamp + " " + msg.username + ": " + msg.message)));
    } else {
      $('#messages').append($('<li>').text(msg.timestamp + " " + msg.username + ": " + msg.message));
    }
  });

});


function isNonEmptyString(str){
  if(str !== ""){
    return true;
  } else {
    return false;
  }
}
