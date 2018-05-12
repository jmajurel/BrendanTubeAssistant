var express = require('express');
var bodyParser = require('body-parser');
var helpers    = require('./helpers');

const { dialogflow } = require('actions-on-google');
const app = dialogflow();

app.intent('status_update', helpers.getStatusUpdate);

express().use(bodyParser.json(), app).listen(process.env.PORT)
