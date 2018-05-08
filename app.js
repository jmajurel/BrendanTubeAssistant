var express = require('express');
var bodyParser = require('body-parser');
const { dialogflow } = require('actions-on-google');

const app = dialogflow();

app.intent('tube_line_status', (conv, {tube_line}) => {
  conv.close(`You requested the update for the tube line called ${tube_line}`); 
});

express().use(bodyParser.json(), app).listen(process.env.PORT)
