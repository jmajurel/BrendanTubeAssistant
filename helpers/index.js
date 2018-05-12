var rp = require('request-promise-native');

var modulePackage = {}

const rpOption = {
  baseUrl: 'https://api.tfl.gov.uk/',
  qs: {
    app_id: process.env.TFLAppId,
    app_key: process.env.TFLAppKey
  },
  json: true
};

const conversationFallback = conv => {
  conv.ask(`Sorry I cannot get the tube update at the moment`);
}

const extractStatusUpdate = lines => {
  return lines.reduce((acc, {name: tubeName, lineStatuses}) => {
    let statuses = lineStatuses.reduce((acc, {statusSeverityDescription:statusDesc, reason=''})=>{
      acc.push({statusDesc: statusDesc, reason: reason});
      return acc;
    },[]);
    acc.push({name: tubeName, statuses: statuses});
    return acc;
  },[])
};

const dataPrepForConversation = linesUpdate => {

  let delayedLines = linesUpdate.filter(lineUpdate => lineUpdate.statuses.filter({statusDesc, reason} => statusDesc === 'Good Service').length === 0)

  if(delayedLines.length > 0){
    delayedLines.reduce((acc, {name, statuses}) => {
      statuses.forEach({statusDesc} => {
	acc[statusDesc] += ` ${name}`; 
      });
      return acc;
    },{});
};

const conversationResult = (delays, conv) => {
  if(delays > 0) {
    let sentence = delays.length > 1 ? 'there are ' : 'there is ';
    for(let [key, val] of delays){
      sentence += `${key} on ${val} `
    }
    conv.ask(sentence);
  } else {
    conv.ask('Good service on All lines');
  }
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

modulePackage.getStatusUpdate = () => {

  rpOption.uri = "/Line/Mode/tube/Status";

  return rp(rpOption)
    .then(extractStatusUpdate)
    .then(dataPrepForConversation)
    .then(conversationResult)
//    .then(visualResult)
    .catch(conversationFallback); 
};

module.exports = modulePackage;
