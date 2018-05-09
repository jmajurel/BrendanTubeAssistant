var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

const { dialogflow } = require('actions-on-google');

const tflAppId = 'a199d638';
const tflAppKey = '4b9cf6ea343b37629649c8d7df2f2e3c';

const app = dialogflow();


app.intent('tube_status', (conv, {tube_line}) => {

 const option = {
   uri: `https://api.tfl.gov.uk/Line/${tube_line}/Status`,
   qs: {
     app_id: tflAppId,
     app_key: tflAppKey
   },
   json: true
 };
 request(option, function(err, res, tubeUpdate){
   if(!err && res.statusResponse === 200 && tubeUpdate){
     let status = tubeUpdate[0].lineStatuses[0].statusSeverityDescription;
     conv.close(`There is ${status} on the ${tube_line} line.
	 Do you wish to know the status for any other line?`); 
   } else {
     conv.close(`Sorry I cannot get the status update for the ${tube_line} line, 
	 Do you wish to know the status for any other line?`);
   }
 });
});

express().use(bodyParser.json(), app).listen(process.env.PORT)
