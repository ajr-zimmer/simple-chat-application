// shorthand for $(document).ready(...)
$(function() {
  var client = io();
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
    $('#messages').append($('<li>').text(msg));
  });

  client.on('update users', function(users){
    $('#usernames').empty();
    $.each(users, function(clientId, username){
      $('#usernames').append($('<li>').text(username));
    });
  });
});


function isNonEmptyString(str){
  if(str !== ""){
    return true;
  } else {
    return false;
  }
}
