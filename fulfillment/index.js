'use strict';

const {Table, Button, Suggestions} = require('actions-on-google');

const {ssml} = require('../helpers/utils.js');
const businessB = require('../helpers/businessBehaviours.js');
const callers = require('../helpers/callers.js');

/* Brendan London Tube expert - fulfillments */

let modulePackage = {};
const features = ['status update', 'status update at future date'];

//UC1 tube status update
modulePackage.statusUpdates = async (conv) => {

  try { 
    let [severity, lines] = await Promise.all([callers.getSeverity(), callers.getStatus()]);
    let updates = businessB.summarizedStatus(lines);
    let panel = businessB.generatedStatusPanel(lines);
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
};

//UCX provide tube lines list
modulePackage.lines = async (conv) => {

  try {
    let lines = await callers.getLines();
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
};

//welcome intent handler 
modulePackage.welcome = (conv) => {
  conv.ask('Hi there, I am Brendan the tube expert in London');
  conv.ask(new Suggestions(features));
};

//default intent handler 
modulePackage.defaultFallback = (conv) => {
  conv.ask('Sorry dear traveller, I didn\'t catch it');
  conv.ask(new Suggestions(features));
};

module.exports = modulePackage;
