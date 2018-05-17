var express = require('express');
var bodyParser = require('body-parser');
const {dialogflow} = require('actions-on-google');

<<<<<<< HEAD
const brendan = require('./fulfillment');
=======
const {convStatusUpdates, convLines}  = require('./helpers');
>>>>>>> 013ff0a905c77d893e501569532305b7b6d2f4d8

const app = dialogflow();

<<<<<<< HEAD
app.intent('status_updates', brendan.statusUpdates); //UC1
app.intent('lines', brendan.lines);
app.intent('Default Fallback Intent', brendan.defaultFallback);
app.intent('Default Welcome Intent', brendan.welcome);
=======
app.intent('status_updates', convStatusUpdates);
app.intent('lines', convLines);
>>>>>>> 013ff0a905c77d893e501569532305b7b6d2f4d8

express().use(bodyParser.json(), app).listen(process.env.PORT);
