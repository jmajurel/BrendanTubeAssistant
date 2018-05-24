'use strict';

const {
  Table, 
  Button, 
  Suggestions, 
  Permission,
  Place } = require('actions-on-google');
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
        brendan.say(` ${status} on ${insertSsmlBreak(lines, 80)}`);
      }
    } else {
      let [uniqueStatus] = updates;
      brendan.say(` ${uniqueStatus[0]} on all lines`);
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
    let lines = await callers.getLines();
    let sanitisedLines = sanitiseForSsml(lines.map(({name}) => name));
    let brendan = new ssml();

    brendan.say('There are')
      .say({
        text: `${lines.length}`,
        interpretAs: 'cardinal'
      })
      .say(` tube lines in London which are ${insertSsmlBreak(sanitisedLines, 80)}`);

    //conversation reply
    conv.ask(brendan.toString({ full:true, minimal: true }));

    //visual reply
    conv.ask(new Table({
      title: 'Tube Lines',
      dividers: true,
      columns: ['name'],
      rows: [sanitisedLines]
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

//UCX journey
modulePackage.journey = (conv) => {
  conv.ask(new Permission({
    context: 'Get current location',
    permissions: 'DEVICE_PRECISE_LOCATION',
    }));
}

modulePackage.get_location = (conv, params, permissionGranted) => {
  if(!permissionGranted){
    conv.ask('I need to get your location to calculate your tube journey');
    conv.ask('Can you give me your permission?');
  } else {
    const {coordinates} = conv.device.location;
    conv.user.storage.location = coordinates;

    conv.ask(`You are at lat: ${coordinates.latitude} lng: ${coordinates.longitude}`);
    conv.ask(new Place({
      prompt: 'What is your destination?',
      context: 'Get destination',
    }));
  }
}

modulePackage.get_destination = async (conv, params, place, status) => {
  if(!place) {
    conv.ask("Sorry, I couldn't find where you want to go");
  } else {
    let {coordinates: endPoint} = place;
    console.log(place);
    let startPoint = conv.user.storage.location;

    let journey = await callers.getJourney(startPoint, endPoint); 
    console.log(journey);
    conv.ask('this is your journey');
  }
}

module.exports = modulePackage;
