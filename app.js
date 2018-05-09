var express = require('express');
var bodyParser = require('body-parser');
var rp = require('request-promise-native');

const { dialogflow } = require('actions-on-google');

const tflAppId = 'a199d638';
const tflAppKey = '4b9cf6ea343b37629649c8d7df2f2e3c';

const app = dialogflow();
const option = {
  uri: `https://api.tfl.gov.uk/Line/${tube_line}/Status`,
  qs: {
    app_id: tflAppId,
    app_key: tflAppKey
  },
  json: true
};

app.intent('tube_status', (conv, {tube_line}) => {
 rp.request(option) 
   .then(function(tubeUpdate){
     let status = tubeUpdate[0].lineStatuses[0].statusSeverityDescription;
     conv.ask(`There is ${status} on the ${tube_line} line.
	 Do you wish to know the status for any other line?`); 
   })
   .catch(function(err){
      conv.ask(`Sorry I cannot get the status update for the ${tube_line} line, 
	Do you wish to know the status for any other line?`);
   });
});

express().use(bodyParser.json(), app).listen(process.env.PORT)
