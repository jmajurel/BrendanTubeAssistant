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
    .then(body => body.filter(({modeName}) => modeName !== 'tube'))
}

function getSeverityDesc(arr, level){
  let {description} = arr.find(({severityLevel}) => severityLevel === level);
  return description;
}

function getStatus() {
  rpOption.uri = '/Line/Mode/tube/Status';
  return rp(rpOption)
}

async function summarizedStatus() {
  let [severity, lines] = await Promise.all([getSeverity(), getStatus()]);
  return lines.reduce((summary, {name, lineStatuses}) => {
    lineStatuses.forEach(({statusSeverity}) => {
      let description = getSeverityDesc(severity, statusSeverity);
      summary.has(description) ? summary.set(description, `${summary.get(description)} ${name}`) : summary.set(description, name);
    });
    return summary;
  }, new Map());
}

modulePackage.convStatusUpdate = async (conv) => {
  
  let updates = await summarizedStatus();
  let sentence = ''; 
  if(updates.length > 1){
    sentence = 'There are ';
    for(let [status, lines] of updates){
      sentence += `${status} on ${lines}`;
    }
  } else {
    let [UniqueStatus] = updates;
    sentence = `There is ${UniqueStatus[0]} on all lines`;
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

