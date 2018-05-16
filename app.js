var express = require('express');
var bodyParser = require('body-parser');

const helpers = require('./helpers/index.js');

const { dialogflow } = require('actions-on-google');
const app = dialogflow();

app.intent('status_updates', helpers.convStatusUpdates);
app.intent('lines', helpers.convLines);

express().use(bodyParser.json(), app).listen(process.env.PORT)
