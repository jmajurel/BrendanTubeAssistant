var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

const { dialogflow } = require('actions-on-google');

const tflAppId = 'a199d638';
const tflAppKey = '4b9cf6ea343b37629649c8d7df2f2e3c';

const app = dialogflow();

app.intent('tube_status', (conv, {tube_line}) => {
  request({
    url: `https://api.tfl.gov.uk/Line/${tube_line}/Status`,
    qs: {
      app_id: tflAppId,
      app_key: tflAppKey
    }
  }) 
  .on('response', function(response){
    if(response.statusCode === 200) {
      response.on('data', function(data){
	var statusTube = data;
        conv.ask(`There is ${statusTube.lineStatuses.statusSeverityDescription} on the ${tube_line} line.
	  Do you wish to know the status for any other line?`); 
      })
    }
  })
  .on('error', function(error){
    conv.ask(`Sorry I cannot get the status update for the ${tube_line} line, 
	Do you wish to know the status for any other line?`);

  });
});

express().use(bodyParser.json(), bodyParser.urlencoded({ extended: false }), app).listen(process.env.PORT)
