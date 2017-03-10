// shorthand for $(document).ready(...)
$(function() {
  var client = io();
  $('form').submit(function(){
    if(isNonEmptyString($('#m').val())){
      client.emit('send message', $('#m').val());
      $('#m').val('');
    }
    return false;
  });
  client.on('display message', function(msg){
    $('#messages').append($('<li>').text(msg));
  });
});


function isNonEmptyString(str){
  if(str !== ""){
    return true;
  } else {
    return false;
  }
}
