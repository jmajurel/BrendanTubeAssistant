var express = require('express');
var bodyParser = require('body-parser');
const {dialogflow} = require('actions-on-google');

const {convStatusUpdates, convLines}  = require('./helpers');

const app = dialogflow();

app.intent('status_updates', convStatusUpdates);
app.intent('lines', convLines);

express().use(bodyParser.json(), app).listen(process.env.PORT)
