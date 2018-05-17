var express = require('express');
var bodyParser = require('body-parser');

const brendan = require('./fulfillment');

const { dialogflow } = require('actions-on-google');
const app = dialogflow();

app.intent('status_updates', brendan.statusUpdates); //UC1
app.intent('lines', brendan.lines);
app.intent('Default Fallback Intent', brendan.defaultFallback);
app.intent('Default Welcome Intent', brendan.welcome);

express().use(bodyParser.json(), app).listen(process.env.PORT);
