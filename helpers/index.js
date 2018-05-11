var rp = require('request-promise-native');

var modulePackage = {}

const rpOption = {
  baseUrl: "https://api.tfl.gov.uk/
  qs: {
    app_id: process.env.TFLAppId,
    app_key: process.env.TFLAppKey
  },
  json: true
};

class tubeLine() {
  constructor(name, status="", reason=""){
    this.name = name;
    this.status = status;
    this.reason = reason;
  }
}

modulePackage.getStatusUpdate = () => {

  rpOption.uri = "/Line/Mode/tube/Status";

  return rp(rpOption)
    .then(lines => { 
      return [{name, lineStatus: [{statusSeverityDescription: status, reason} ]}]= [{lineStatus:[{reason=''}]}] = lines;
    })
    .then
};

module.exports = modulePackage;
