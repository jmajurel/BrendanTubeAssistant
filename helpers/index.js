'use strict'

const rp = require('request-promise-native');
const {ssml} = require('./utils');

const { Table, Button } = require('actions-on-google');

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

function getStatus() {
  rpOption.uri = '/Line/Mode/tube/Status';
  return rp(rpOption)
}

function getLines() {
  let modes = 'tube';
  rpOption.uri = `/Line/Mode/${modes}`;
  return rp(rpOption)
}

function getTubeSeverityDesc(arr, level){
  let {description} = arr.find(({severityLevel}) => severityLevel === level);
  return description;
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
    let statusDesc = lineStatuses.map(({statusSeverityDescription: description}) => description).join(', ');
    acc.push([lineName, statusDesc]);
    return acc;
  }, []);  
  return new Table({
    title: 'Status Update',
    dividers: true,
    columns: ['Line', 'Status'],
    rows: statusUpdate,
    button: new Button({
      title: 'Get more info',
      url: 'https://tfl.gov.uk'
    })
  });
}

const convStatusUpdates = async (conv) => {

  try { 
    let [severity, lines] = await Promise.all([getSeverity(), getStatus()]);
    let updates = summarizedStatus(lines);
    let panel = generatedStatusPanel(lines);
    let sentence = ''; 
    if(updates.length > 1){
      sentence = 'There are ';
      for(let [status, lines] of updates){
	sentence += `<emphasis level="strong">${status} on ${lines}</emphasis>`;
      }
    } else {
      let [uniqueStatus] = updates;
      sentence = `There is <emphasis level="strong">${uniqueStatus[0]} on all lines</emphasis>`;
    }
    conv.ask(ssml`
	<speak>
	  ${sentence}
	</speak>`);
    conv.ask(panel);

  } catch(e) {
    console.log(e);
    conv.ask('Sorry I cannot get the tube update at the moment');
  }
}

const convLines = async (conv) => {

  try {
    let lines = await getLines();
    lines = lines.map(({name}) => name);
    conv.ask(ssml`
	<speak>
	  There are <say-as interpret-as="unit">${lines.length} tube lines</say-as> in London which are ${lines.join(' ')}
	</speak>
	`);
    conv.ask(new Table({
      title: 'Tube Lines',
      dividers: true,
      columns: ['name'],
      rows: [lines]
    }));
  } catch(e) {
    conv.ask('Sorry I cannot tell you that answer at the moment');
  } 
}

module.exports = {convLines, convStatusUpdates};
