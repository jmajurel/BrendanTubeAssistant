'use strict';

/* time parameter in ms*/
const insertSsmlBreak = (arr, time='') => {
  return time ? 
    arr.join(`<break time="${time}ms"/>`)
  :
    arr.join('<break/>');
};

const sanitiseForSsml = (arr) => {
  return arr.map(item => {
     return item
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
  })
};

module.exports = { insertSsmlBreak, sanitiseForSsml };
