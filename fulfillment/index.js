'use strict';

const {Table, Button, Suggestions} = require('actions-on-google');
const ssml = require('ssml');

const {sanitiseForSsml, insertSsmlBreak} = require('../helpers/utils.js');
const businessB = require('../helpers/businessBehaviours.js');
const callers = require('../helpers/callers.js');

/* Brendan London Tube expert - fulfillments */

let modulePackage = {};
const features = ['update', 'lines'];

//UC1 tube status update
modulePackage.statusUpdates = async (conv) => {

  try { 
    let [severity, lines] = await Promise.all([callers.getSeverity(), callers.getStatus()]);
    let updates = businessB.summarizedStatus(lines);
    let panel = businessB.generatedStatusPanel(lines);

    /* Build sentence for Brendan */
    let brendan = new ssml();

    brendan.say('There are');

    if(updates.size > 1){
      for(let [status, lines] of updates){
	lines = sanitiseForSsml(lines);
        brendan.say(`${status} on ${insertSsmlBreak(lines, 80)}`);
      }
    } else {
      let [uniqueStatus] = updates;
      brendan.say(`${uniqueStatus[0]} on all lines`);
    }

    //conversation reply
    conv.ask(brendan.toString({ full:true, minimal: true }));

    //visual rely
    conv.ask(panel); 

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
    var lines = await callers.getLines();
    var sanitisedLines = sanitiseForSsml(lines.map(({name}) => name));
    let brendan = new ssml();

    brendan.say('There are')
      .say({
        text: `${lines.length}`,
        interpretAs: 'cardinal'
      })
      .say(` tube lines in London which are ${insertSsmlBreak(sanitisedLines, 80)}`)

    //conversation reply
    conv.ask(brendan.toString({ full:true, minimal: true }));

    //visual reply
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
  conv.ask('Additionaly, I can give you the status update'); //drive the conversation to available intents
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
