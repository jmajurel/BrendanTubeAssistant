const {BasicCard, Button, Suggestions} = require('actions-on-google');
const helpers = require('../helpers');

var modulePackage = new Map();

modulePackage.set('status_update', conv => {
  return getStatusUpdate()
    .then(statusUpdate => {
      conv.ask();  
    })
    .catch(err => {
      conv.ask(new Suggestions('I can give you other information'));
    });
})

module.exports = modulePackage;
