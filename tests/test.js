const { ActionsOnGoogleAva } = require('actions-on-google-testing');
const actions = new ActionsOnGoogleAva(require('../../test-credentials.json'));

const FAKE_PROMPT = [ 
  'blablabla I told you this app is awesome',
  'What else?!',
  'I am drinking coffee'
];

actions.startTest('Get tube update', action => {

  return action.startConversation()
    .then(({textToSpeech}) => {
      return action.send('update');
    })
    .then(({update}) => {
      console.log(update);
      return action.endTest();
    })
})
