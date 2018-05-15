var rp = require('request-promise-native');

let modulePackage = {};

const rpOption = {
  baseUrl: 'https://api.tfl.gov.uk/',
  qs: {
    app_id: process.env.TFLAppId,
    app_key: process.env.TFLAppKey
  },
  json: true
};

function getSeverity() {
  rpOption.uri = '/Line/Meta/Severity';
  return rp(rpOption)
    .then(body => body.find(({modeName}) => modeName === 'tube'))
}

function getStatus() {
  rpOption.uri = '/Line/Mode/tube/Status';
  return rp(rpOption)
}

async function summarizedStatus() {
  let [severity, lines] = await Promise.all([getSeverity, getStatus]);
  return lines.reduce((summary, {name, lineStatuses}) => {
    lineStatuses.forEach(({statusSeverity}) => {
      let {description: statusTitle} = severity.find(item => item.severityLevel === statusSeverity);
      summary[statusTitle] += ` ${name}`;
    });
  }, {});
}

modulePackage.convStatusUpdate = async (conv) => {
  
  let updates = await summarizedStatus();
  let sentence = updates.length > 1 ? 'There are ' : 'There is ';
  for(let [status, lines] of updates){
    sentence += `${status} on ${lines}`;
  }
  conv.ask(sentence);
}

module.exports = modulePackage;

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

