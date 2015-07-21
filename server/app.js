/*jslint unparam: true, node: true */
var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var server = require('http').Server(app);

var io = require('socket.io')(server);
var router = express.Router();
var apiRouter = express.Router();
var port = process.env.PORT || 8080;

var list = ["item 1", "item 2"];

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// code to get around CORS
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  next();
});

// routes for the api
apiRouter.get('/', function (req, res) {
  res.json({
    message: 'I am the API!'
  });
});

// routes for the static pages
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/../client/index.html'));
});
app.get('/files/listSocketClient.js', function (req, res) {
  res.sendFile(path.join(__dirname + '/../client/listSocketClient.js'));
});


// set up routers with server
app.use(express.static(__dirname + '../client'));
app.use('/api', apiRouter);

server.listen(port);

console.log('Server is running on port %d', port);

io.on('connection', function (socket) {
  socket.emit('user-connected', list);

  socket.on('new-item-added', function (data) {
    list.push(data.newItem);
    socket.emit('new-item-added-client', data);
    socket.broadcast.emit('new-item-added-client', data);
  });
  socket.on('typing-client', function (data) {
    socket.broadcast.emit('typing-client');
  });
});
