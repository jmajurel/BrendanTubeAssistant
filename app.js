const express = require('express');
const bodyParser = require('body-parser');
const {dialogflow} = require('actions-on-google');

const brendan = require('./fulfillment');

const app = dialogflow();

app.intent('status_updates', brendan.statusUpdates); //UC1
app.intent('journey', brendan.journey); //UC2
app.intent('lines', brendan.lines);
app.intent('get_location', brendan.get_location);
app.intent('get_destination', brendan.get_destination);

app.intent('repeat', brendan.repeat);
app.intent('help', brendan.help);
app.intent('Default Fallback Intent', brendan.defaultFallback);
app.intent('Default Welcome Intent', brendan.welcome);

express().use(bodyParser.json(), app).listen(process.env.PORT);
