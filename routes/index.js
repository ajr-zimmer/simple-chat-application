var express = require('express');
var router = express.Router();

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//app.use(express.static(__dirname + '/public'));


router.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});





module.exports = router;
