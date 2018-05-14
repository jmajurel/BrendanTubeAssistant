var rp = require('request-promise-native');

var modulePackage = {};

const rpOption = {
  baseUrl: 'https://api.tfl.gov.uk/',
  qs: {
    app_id: process.env.TFLAppId,
    app_key: process.env.TFLAppKey
  },
  json: true
};


/*const visualResult = (delays, conv) => {
  conv.ask(new BasicCard({
    title: `${tube_line} line Update`,
    text: statusSeverityDescription,
    buttons: new Button({
      title: 'More on tfl website',
      url:'https://tfl.gov.uk/tube-dlr-overground/status/'
    })
  }))
};
*/

modulePackage.getStatusUpdate = conv => {

  rpOption.uri = "/Line/Mode/tube/Status";

  return rp(rpOption)
    .then({name: tubeName, lineStatuses: [{statusSeverityDescription: statusDesc, reason}]} = {lineStatuses: [{reason:''}]});
    .then(linesUpdate => {
      var delayedLines = linesUpdate.find(({lineStatuses: [statusDesc]}) => statusDesc !== 'Good Service'); 
      if(delayedLines.length > 0){
	return delayedLines.reduce((acc, {name, statuses}) => {
	  statuses.forEach(({statusDesc}) => {
	    acc[statusDesc] += ` ${name}`; 
	  });
	  return acc;
	},{});
      }
      return delayedLines;
    })
    .then(delays => {
      if(delays > 0) {
	let sentence = delays.length > 1 ? 'there are ' : 'there is ';
	for(let [key, val] of delays){
	  sentence += `${key} on ${val} `
	}
	conv.ask(sentence);
      } else {
	conv.ask('Good service on All lines');
      }
    })
//  .then(visualResult)
    //.catch(() => conv.ask(`Sorry I cannot get the tube update at the moment`)); 
};

module.exports = modulePackage;
