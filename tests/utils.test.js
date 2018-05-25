const utils = require('../helpers/utils.js');

const FAKE_PROMPT = [ 
  'blablabla I told you this app is awesome',
  'What else?!',
  'I am drinking coffee'
];

test('get random sentence from fetchPrompt', () => {
  let result = utils.fetchPrompt(FAKE_PROMPT); 
  expect(FAKE_PROMPT).toContain(result);
});
