var express = require('express');
var bodyParser = require('body-parser');
const { dialogflow } = require('actions-on-google');

const app = dialogflow();

app.intent('tube_status', (conv, {tube_line}) => {
  conv.close(`You requested the update for the tube called ${tube_line} line`); 
});

express().use(bodyParser.json(), app).listen(process.env.PORT)
