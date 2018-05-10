var express = require('express');
var bodyParser = require('body-parser');
var brendan  = require('brendan');

const {dialogflow} = require('actions-on-google');
const app = dialogflow();

app.intent(brendan);

/*app.intent('tube_status', (conv, {tube_line}) => {

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
*/

express().use(bodyParser.json(), app).listen(process.env.PORT)
