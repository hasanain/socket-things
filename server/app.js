/*jslint unparam: true, node: true */
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();
var router = express.Router();
var apiRouter = express.Router();
var port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  next();
});

// routes for the api
apiRouter.get('/', function (req, res) {
  res.json({
    message: 'I am the API'
  });
});
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/../client/index.html'));
});
app.use(express.static(__dirname + '../client'));
app.use('/api', apiRouter);

app.listen(port);
console.log('Server is running on port %d', port);
