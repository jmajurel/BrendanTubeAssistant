'use strict';

const rp = require('request-promise-native');
/* API calls */

const rpOption = {
  baseUrl: 'https://api.tfl.gov.uk/',
  qs: {
    app_id: process.env.TFLAppId,
    app_key: process.env.TFLAppKey
  },
  json: true
};

let modulePackage = {};
const transportMode = 'tube';

modulePackage.getSeverity = function(){
  rpOption.uri = '/Line/Meta/Severity';
  return rp(rpOption)
}

modulePackage.getStatus = function(){
  rpOption.uri = `/Line/Mode/${transportMode}/Status`; 
  return rp(rpOption);
}

modulePackage.getLines = function(){
  rpOption.uri = `/Line/Mode/${transportMode}`;
  return rp(rpOption);
}

modulePackage.getFutureStatusForOneLine = function(line, startDate, endDate){
  rpOption.uri = `/Line/${line}/Status/${startDate}/to/${endDate}`;
  return rp(rpOption);
}

module.exports = modulePackage;
