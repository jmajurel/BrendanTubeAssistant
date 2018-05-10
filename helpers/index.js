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

modulePackage.getStatusUpdate = () => {

  rpOption.uri = "/Line/Mode/tube/Status";

  return rp(rpOption)
    .then(body => {
      return body.reduce((acc, line) => {
	let stat = line.lineStatuses.reduce((acc, statusLine) => {
	  acc += `statusLine.statusSeverityDescription `;
	  return acc;
	}, "");
	acc.set(line.name, stat);
	return acc;
      }, new Map());
    })
};

module.exports = modulePackage;
