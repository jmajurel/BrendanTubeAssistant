'use strict';

const {Table, Button, Suggestions} = require('actions-on-google');

const {ssml, insertSsmlBreak} = require('../helpers/utils.js');
const businessB = require('../helpers/businessBehaviours.js');
const callers = require('../helpers/callers.js');

/* Brendan London Tube expert - fulfillments */

let modulePackage = {};
const features = ['Update', 'Future'];

//UC1 tube status update
modulePackage.statusUpdates = async (conv) => {

  try { 
    let [severity, lines] = await Promise.all([callers.getSeverity(), callers.getStatus()]);
    let updates = businessB.summarizedStatus(lines);
    let panel = businessB.generatedStatusPanel(lines);

    /* Build sentence for Brendan */
    let sentence = `<p>There are`;
    if(updates.length > 1){
      for(let [status, lines] of updates){
	sentence += `<s><emphasis level="moderate">${status}</emphasis> on the ${insertSsmlBreak(lines)}</s>`;
      }
    } else {
      let [uniqueStatus] = updates;
      sentence = `<s>There is <emphasis level="moderate">${uniqueStatus[0]}</emphasis> on all lines</s>`;
    }
    sentence += ssml`</p>`

    conv.ask(ssml`
	<speak>
	  ${ssmlsentence}
	</speak>`);

    conv.ask(panel); //visual response

  } catch(e) {
    console.log(e);
    conv.ask('Sorry I cannot get the tube update at the moment');
    conv.ask('I can give you the latest tube update or the list of tube lines in London, which one of these do you want to be inform?'); //drive the conversation to available intents
  }
  conv.ask(new Suggestions(...features)); //suggestion chips for visual interface
};

//UCX provide tube lines list
modulePackage.lines = async (conv) => {

  try {
    let lines = await callers.getLines();
    lines = insertSsmlBreak(lines.map(({name}) => name));

    conv.ask(ssml`
	<speak>
	  There are <say-as interpret-as="cardinal">${lines.length}</say-as> tube lines in London which are ${lines}
	</speak>`);

    conv.ask(new Table({
      title: 'Tube Lines',
      dividers: true,
      columns: ['name'],
      rows: [lines]
    }));
  } catch(e) {
    console.log(e);
    conv.ask('Sorry I cannot tell you that answer at the moment');
    conv.ask('I can give you the latest tube update or the list of tube lines in London, which one of these do you want to be inform?'); //drive the conversation to available intents
  } 
  conv.ask(new Suggestions(...features)); //suggestion chips for visual interface
};

//welcome intent handler 
modulePackage.welcome = (conv) => {
  conv.ask('Hi there, I am Brendan the tube expert in London'); //greating welcome message
  conv.ask('I can give you the latest tube update or the list of tube lines in London, which one of these do you want to be inform?'); //drive the conversation to available intents
  conv.ask(new Suggestions(...features)); //suggestion chips for visual interface
};

//default intent handler 
modulePackage.defaultFallback = (conv) => {
  conv.ask('Sorry dear traveller, I didn\'t catch it');
  conv.ask('I can give you the latest tube update or the list of tube lines in London, which one of these do you want to be inform?'); //drive the conversation to available intents
  conv.ask(new Suggestions(...features));
};

module.exports = modulePackage;
