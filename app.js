const express = require('express');
const bodyParser = require('body-parser');
const { dialogflow } = require('actions-on-google');

const brendan = require('./fulfillment');
const ssml = require('ssml');

const app = dialogflow();

app.middleware(conv => {
  conv.data.brendanSays = new ssml();
}) 

/* UC1 - status update */
app.intent('status_updates', brendan.statusUpdates); 

/* UC2 - journey planner */
app.intent('journey', brendan.journey); 
app.intent('get_location', brendan.get_location);
app.intent('get_destination', brendan.get_destination);

/* UCX - Bonus - tube lines */
app.intent('lines', brendan.lines); 

app.intent('repeat', brendan.repeat);
app.intent('help', brendan.help);
app.intent('Default Fallback Intent', brendan.defaultFallback);
app.intent('Default Welcome Intent', brendan.welcome);

express().use(bodyParser.json(), app).listen(process.env.PORT);
