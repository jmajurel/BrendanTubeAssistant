'use strict';

const {
  Table, 
  Button, 
  Suggestions, 
  Permission,
  Place } = require('actions-on-google');

const ssml = require('ssml');

const {sanitiseForSsml, insertSsmlBreak, fetchPrompt} = require('../helpers/utils.js');
const businessB = require('../helpers/businessBehaviours.js');
const callers = require('../helpers/callers.js');

/* Brendan London Tube expert - fulfillments */

let modulePackage = {};
const features = ['update', 'lines', 'journey'];

const REPEAT_PREFIX = [
    'Sorry, I said ',
    'Let me repeat that. ',
];

const HELP_PROMPTS = [
  'I can give you the tube status update, plan a journey or tell you which tube lines are present in London',
  'Hmm I can help you with your tube journey, inform you about the latest status update or additionaly tell you how many lines are present in the london underground network'
];

const WELCOME_PROMPTS = [
  'Hi There, I am Brendan the London tube expert'
];

const DEFAULT_FALLBACK = [
  'Sorry dear traveller, I didn\'t catch that'
];

//proxy function that store the previous conversation 
function ask(conv, inputPrompt) {
  conv.data.lastPrompt = inputPrompt;
  conv.ask(inputPrompt);
}

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
    ask(conv, brendan.toString({ full:true, minimal: true }));
    ask(conv, panel);

    //visual rely

  } catch(e) {
    console.log(e);
    ask(conv, 'Sorry I cannot get the tube update at the moment');
    ask(conv, 'I can give you the latest tube update or the list of tube lines in London, which one of these do you want to be inform?'); //drive the conversation to available intents
  }
  ask(conv, new Suggestions(...features)); //suggestion chips for visual interface
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
    ask(conv, brendan.toString({ full:true, minimal: true }));

    //visual reply
    ask(conv, new Table({
      title: 'Tube Lines',
      dividers: true,
      columns: ['name'],
      rows: [sanitisedLines]
    }));
  } catch(e) {
    console.log(e);
    ask(conv, 'Sorry I cannot tell you that answer at the moment');
    ask(conv, 'I can give you the latest tube update or the list of tube lines in London, which one of these do you want to be inform?'); //drive the conversation to available intents
  } 
  ask(conv, 'Additionaly, I can give you the status update'); //drive the conversation to available intents
  ask(conv, new Suggestions(...features)); //suggestion chips for visual interface
};



//UCX journey
modulePackage.journey = (conv) => {
  ask(conv, new Permission({
    context: 'Current location',
    permissions: 'DEVICE_PRECISE_LOCATION',
    }));
}

modulePackage.get_location = (conv, params, permissionGranted) => {
  if(!permissionGranted){
    ask(conv, 'I need to get your location to calculate your tube journey');
    ask(conv, 'Can you give me your permission?');
  } else {
    const {coordinates} = conv.device.location;
    conv.user.storage.location = coordinates;

    ask(conv, `You are at lat: ${coordinates.latitude} lng: ${coordinates.longitude}`);
    ask(conv, new Place({
      prompt: 'What is your destination?',
      context: 'Get destination',
    }));
  }
}

modulePackage.get_destination = async (conv, params, place, status) => {
  if(!place) {
    ask(conv, "Sorry, I couldn't find where you want to go");
  } else {
    let {coordinates: endPoint} = place;
    console.log(place);
    let startPoint = conv.user.storage.location;

    let journey = await callers.getJourney(startPoint, endPoint); 
    console.log(journey);
    ask(conv, 'this is your journey');
  }
}

//repeat intent
modulePackage.repeat = conv => {
  console.log(conv.data.lastPrompt);
  ask(conv, fetchPrompt(REPEAT_PREFIX) + conv.data.lastPrompt);
}

//help intent
modulePackage.help = conv => {
  ask(conv, fetchPrompt(HELP_PROMPTS));
  ask(conv, 'What would you be interrested in ?');
  ask(conv, new Suggestions(...features));
}

//welcome intent handler 
modulePackage.welcome = (conv) => {
  ask(conv, fetchPrompt(WELCOME_PROMPTS)); //greating welcome message
  ask(conv, fetchPrompt(HELP_PROMPTS)); //drive the conversation to available intents
  ask(conv, 'What would you be interrested in ?'); 
  ask(conv, new Suggestions(...features));//suggestion chips for visual interface
};

//default intent handler 
modulePackage.defaultFallback = (conv) => {
  ask(conv, fetchPrompt(DEFAULT_FALLBACK));
  ask(conv, fetchPrompt(HELP_PROMPTS)); //drive the conversation to available intents
  ask(conv, 'What would you be interrested in ?');
  ask(conv, new Suggestions(...features));
};

module.exports = modulePackage;
