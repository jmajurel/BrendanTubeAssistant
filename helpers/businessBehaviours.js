'use strict';

const {Table, Button} = require('actions-on-google');

/* Basic Business behaviours */

let modulePackage = {};

modulePackage.getTubeSeverity = async function() {
  let severities = await getSeverity();
  return severities.filter(({modeName}) => modeName !== 'tube');
}

modulePackage.getFutureStatusForAllLines = async function(startDate, endDate){
  try {
    let lines = await getLines();
    return Promise.all(lines.map(({name: lineName}) => getFutureStatusForOneLine(lineName)));
  } catch(e) {
    console.log(e); 
  }
}

modulePackage.getTubeSeverityDesc = function(arr, level){
  let {description} = arr.find(({severityLevel}) => severityLevel === level);
  return description;
}

//return a map with key=Status value=[lines]
//example: key='major delays', values=['piccadilly', 'district']
//
modulePackage.summarizedStatus = function(lines){
  return lines.reduce((summary, {name, lineStatuses}) => {
    lineStatuses.forEach(({statusSeverity, statusSeverityDescription: statusDesc}) => {
      if(summary.has(statusDesc)){
	var currentVal = summary.get(statusDesc);
        currentVal.push(name)
	summary.set(statusDesc, currentVal);
      } else {
        summary.set(statusDesc, [name]);
      }	
    });
    return summary;
  }, new Map());
}

//return a Table object containing the status update
modulePackage.generatedStatusPanel = function(lines){

  let statusUpdate = lines.reduce((acc, {name: lineName, lineStatuses}) => {
    let statusDesc = lineStatuses.map(({statusSeverityDescription: description}) => description).join(', ');
    acc.push([lineName, statusDesc]);
    return acc;
  }, []);  
  return new Table({
    title: 'Status Update',
    dividers: true,
    columns: ['Line', 'Status'],
    rows: statusUpdate,
    button: new Button({
      title: 'Get more info',
      url: 'https://tfl.gov.uk'
    })
  });
}

module.exports = modulePackage;
