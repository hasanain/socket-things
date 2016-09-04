/*jslint unparam: true, node: true */
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').Server(app);

var port = process.env.PORT || 8080;

var io = require('socket.io')(server);
var router = express.Router();

var list = ["item 1", "item 2"];


// code to get around CORS
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  next();
});


// routes for the static pages
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/../client/index.html'));
});
app.get('/todo', function (req, res) {
  res.sendFile(path.join(__dirname + '/../client/todo.html'));
});
app.get('/chat', function(req, res){
  res.sendFile(path.join(__dirname + '/../client/chat.html'));
});


// set up routers with server
app.use(express.static(path.join(__dirname + '/../client/resources/')));

server.listen(port);

console.log('Server is running on port %d', port);

// TODO list socket
io.of('/todo')
  .on('connection', function (socket) {
  socket.emit('user-connected', list);

  socket.on('new-item-added', function (data) {
    list.push(data.newItem);
    socket.emit('new-item-added-client', data);
    socket.broadcast.emit('new-item-added-client', data);
  });
});

// chat app socket
var messages = [];
var connected = [];
io.of('/chat')
  .on('connection', function(socket){
  var name = socket.request._query['name'];
  if(name !== "") connected.push(name);
  socket.emit('user-connected', {messages: messages, connected: connected, user: name});
  socket.broadcast.emit('new-user-joined', {user:name, connected:connected});
  socket.on('new-message',function(data){
    messages.push(data);
    socket.broadcast.emit('new-message', data);    
  });
  socket.on('disconnect', function(){
    connected.splice(connected.indexOf(name), 1);
    socket.broadcast.emit('user-left', {name: name, connected: connected});
  });
});
