var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//app.use(bodyParser.urlencoded({extended: true});
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.json({fulfillmentText: 'Hello Word!'});
});

app.listen(process.env.PORT,process.env.IP);
