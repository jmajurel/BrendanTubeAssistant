var rp = require('request-promise-native');
const { Table, Button } = require('actions-on-google');

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

//return a map with key=Status value=lines
function summarizedStatus(lines) {
  return lines.reduce((summary, {name, lineStatuses}) => {
    lineStatuses.forEach(({statusSeverity, statusSeverityDescription: statusDesc}) => {
      summary.has(statusDesc) ? summary.set(statusDesc, `${summary.get(statusDesc)} ${name}`) : summary.set(statusDesc, name);
    });
    return summary;
  }, new Map());
}

//return a Table object containing the status update
function generatedStatusPanel(lines){

  let statusUpdate = lines.reduce((acc, {name: lineName, lineStatuses}) => {
    let statusDesc = lineStatuses.map(({description}) => description).join(', ');
    acc.push([lineName, statusDesc]);
    return acc;
  }, []);  
  return new Table({
    tile: 'Status Update',
    dividers: true,
    columns: ['Line', 'Status'],
    rows: statusUpdate,
    button: new Button({
      title: 'Get more info',
      url: 'https://tfl.gov.uk'
    })
  });
}

modulePackage.convStatusUpdate = async (conv) => {

  try { 
    let [severity, lines] = await Promise.all([getSeverity(), getStatus()]);
    let updates = summarizedStatus(lines);
    let panel = generatedStatusPanel(lines);
    let sentence = ''; 
    if(updates.length > 1){
      sentence = 'There are ';
      for(let [status, lines] of updates){
	sentence += `${status} on ${lines}`;
      }
    } else {
      let [uniqueStatus] = updates;
      sentence = `There is ${uniqueStatus[0]} on all lines`;
    }
    conv.ask(sentence);
    conv.ask(panel);

  } catch(e) {
    console.log(e);
    conv.ask('Sorry I cannot get the tube update at the moment');
  }
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

