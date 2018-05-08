var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

const { dialogflow } = require('actions-on-google');

const tflAppId = 'a199d638';
const tflAppKey = '4b9cf6ea343b37629649c8d7df2f2e3c';

const app = dialogflow();

app.intent('tube_status', (conv, {tube_line}) => {
  request({
    method: 'GET',
    uri: `https://api.tfl.gov.uk/Line/${tube_line}/Status`,
    auth: {
      app_id: tflAppId,
      app_key: tflAppKey
    }
  }, function(err, res, body){
    if(!err && res.statusCode === 200 && res) {
      let [res] = body;
      console.log(tube_line);
      console.log(res);
      conv.ask(`There is ${res.lineStatuses.statusSeverityDescription} on the ${tube_line} line.
	  Do you wish to know the status for any other line?
	  `); 
    } else {
      conv.ask(`Sorry I cannot get the status update for the ${tube_line} line, 
	  Do you wish to know the status for any other line?`);
    }
  });
});

express().use(bodyParser.json(), app).listen(process.env.PORT)
