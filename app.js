var express = require('express');
var bodyParser = require('body-parser');
var rp = require('request-promise-native');
const {dialogflow, BasicCard, Button, Suggestions} = require('actions-on-google');

const rpOption = {
  baseUrl: "https://api.tfl.gov.uk/
  qs: {
    app_id: process.env.TFLAppId,
    app_key: process.env.TFLAppKey
  },
  json: true
};

const app = dialogflow();

app.intent('generalUpdate', conv => {

  rpOption.uri = "/Line/Mode/tube/Status";
  return rp(rpOption)
    .then(function(body){

    })
    .catch(function(err){
      conv.ask();
      conv.ask(new Suggestions('I can give you other information'));
    });

});

app.intent('tube_status', (conv, {tube_line}) => {

 rpOption.uri = `/Line/${tube_line}/Status`;

 return rp(rpOption)
   .then(function(body){
     let [{lineStatuses}] = body;
     let [{statusSeverityDescription}] = lineStatuses

     conv.ask(`There is ${statusSeverityDescription} on the ${tube_line} line.
	 Do you wish to know the status for any other line?`); 

     conv.ask(new BasicCard({
       title: `${tube_line} line Update`,
       text: statusSeverityDescription,
       buttons: new Button({
	 title: 'tfl',
	 url:'https://tfl.gov.uk/tube-dlr-overground/status/'
       })
     }));

     conv.ask(new Suggestion('Do you wish to know the status of any other line?'));

   })
   .catch(function(err){
     conv.ask(`Sorry I cannot get the status update for the ${tube_line} line, 
	 Do you wish to know the status for any other line?`);
   });
});

express().use(bodyParser.json(), app).listen(process.env.PORT)
