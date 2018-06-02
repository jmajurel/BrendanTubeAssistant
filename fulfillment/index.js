'use strict';

const {
  Table, 
  Button, 
  Suggestions, 
  Permission,
  Place } = require('actions-on-google');

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
function ask(conv, inputPrompt, noInputPrompt) {

  if(inputPrompt) {
    conv.data.lastPrompt = inputPrompt;
    conv.ask(inputPrompt);
  }

  if(noInputPrompt) {
    conv.data.noInputPrompt = noInputPrompt;
    conv.ask(noInputPrompt);
  }
}

//UC1 tube status update
modulePackage.statusUpdates = async (conv) => {

  try { 
    let [severity, lines] = await Promise.all([callers.getSeverity(), callers.getStatus()]);
    let updates = businessB.summarizedStatus(lines);
    let panel = businessB.generatedStatusPanel(lines);

    /* Build sentence for Brendan */

    conv.data.brendanSays
      .say('There are');

    if(updates.size > 1){
      for(let [status, lines] of updates){
	lines = sanitiseForSsml(lines);
        conv.data.brendanSays.say(` ${status} on ${insertSsmlBreak(lines, 80)}`);
      }
    } else {
      let [uniqueStatus] = updates;
      conv.data.brendanSays.say(` ${uniqueStatus[0]} on all lines`);
    }

    //conversation reply
    ask(conv, conv.data.brendanSays.toString({ full:true, minimal: true }), panel);

  } catch(e) {
    console.log(e);

    conv.data.brendanSays
      .clear()
      .says('Sorry I cannot get the tube update at the moment')
      .break(500)
      .says('I can give you the latest tube update or the list of tube lines in London, which one of these do you want to be inform?');
    
    ask(conv, conv.data.brendanSays.toString({full: true, minimal: true}), new Suggestions(...features));
  }
};


//UC2 journey
modulePackage.journey = (conv) => {
  ask(conv, new Permission({
    context: 'Current location',
    permissions: 'DEVICE_PRECISE_LOCATION',
    }));
}

modulePackage.get_location = (conv, params, permissionGranted) => {
  if(!permissionGranted){
    conv.data.brendanSays
      .say('I need to get your location to calculate your tube journey')
      .break(500)
      .say('Can you give me your permission?');
    ask(conv, conv.data.bredanSays.toString({full: true, minimal: true}))
  } else {
    conv.user.storage.location = conv.device.location;
    ask(conv, new Place({
      prompt: 'What is your destination?',
      context: 'Get destination',
    }));
  }
}

modulePackage.get_destination = async (conv, params, place, status) => {
  if(!place) {
    conv.data.brendanSays
      .say("Sorry, I couldn't find where you want to go");
    ask(conv, conv.data.brendanSays.toString({full: true, minimal: true}));
  } else {
    let {coordinates: endPoint} = place;
    let {coordinates: startPoint} = conv.user.storage.location;
    try {
      let {journeys} = await callers.getJourney(startPoint, endPoint); 
      let {legs: steps} = journeys[0];
      let intructions = steps.map(({instruction}) => instruction.summary);

      conv.data.brendanSays
	.say('Ok, you have to ')
      intructions.forEach((inst, idx, arr) => {
	var suffix = ' and '
	conv.data.brendanSays
	.say(inst)
	.break(500)
	.say(suffix);
      })
      ask(conv, conv.data.brendanSays.toString({full: true, minimal: true}));
    } catch(e) {
      conv.data.brendanSays
	.clear()
	.say('Sorry I cannot tell you that answer at the moment')
	.break(500)
	.say('I can give you the latest tube update or the list of tube lines in London, which one of these do you want to be inform?'); //drive the conversation to available intents
      ask(conv,conv.data.brendanSays.toString({full: true, minimal: true})); 
    }
  }
}

//UCX provide tube lines list [small bonus]
modulePackage.lines = async (conv) => {

  try {
    let lines = await callers.getLines();
    let sanitisedLines = sanitiseForSsml(lines.map(({name}) => name));

    conv.data.brendanSays.say('There are')
      .say({
        text: `${lines.length}`,
        interpretAs: 'cardinal'
      })
      .say(` tube lines in London which are ${insertSsmlBreak(sanitisedLines, 80)}`)
      .break(500)
      .say('Additionaly, I can give you the status update')

    //conversation reply
    ask(conv, conv.data.brendanSays.toString({ full:true, minimal: true }), new Suggestions(...features));

    //visual reply
    /*ask(conv, new Table({
      title: 'Tube Lines',
      dividers: true,
      columns: ['name'],
      rows: [sanitisedLines]
    }));*/
  } catch(e) {

    console.log(e);

    conv.data.brendanSays
      .clear()
      .say('Sorry I cannot tell you that answer at the moment')
      .break(500)
      .say('I can give you the latest tube update or the list of tube lines in London, which one of these do you want to be inform?'); //drive the conversation to available intents

    ask(conv,conv.data.brendanSays.toString({ full: true, minimal: true}));
  } 
};

//repeat intent
modulePackage.repeat = conv => {
  console.log(conv.data.lastPrompt);

  conv.data.brendanSays
    .say(fetchPrompt(REPEAT_PREFIX))
    .break(500)
    .say(conv.data.lastPrompt);

  ask(conv, conv.data.brendanSays.toString({full: true, minimal: true}), new Suggestions(...features));
}

//help intent
modulePackage.help = conv => {

  conv.data.brendanSays
    .say(fetchPrompt(HELP_PROMPTS))
    .break(500)
    .say('What would you be interrested in ?');

  ask(conv, conv.data.brendanSays.toString({full: true, minimal: true}), new Suggestions(...features));
}

//welcome intent handler 
modulePackage.welcome = conv => {

  conv.data.brendanSays
    .say(fetchPrompt(WELCOME_PROMPTS)) //greating welcome message
    .break(500)
    .say(fetchPrompt(HELP_PROMPTS)) //drive the conversation to available intents
    .break(500)
    .say('What would you be interrested in ?') 

  ask(conv, conv.data.brendanSays.toString({full: true, minimal: true}), new Suggestions(...features));//suggestion chips for visual interface
};

//default intent handler 
modulePackage.defaultFallback = conv => {

  conv.data.brendanSays
    .say(fetchPrompt(DEFAULT_FALLBACK)) //greating welcome message
    .break(500)
    .say(fetchPrompt(HELP_PROMPTS)) //drive the conversation to available intents
    .break(500)
    .say('What would you be interrested in ?') 

  ask(conv, conv.data.brendanSays.toString({full: true, minimal: true}), new Suggestions(...features));//suggestion chips for visual interface
};

module.exports = modulePackage;
