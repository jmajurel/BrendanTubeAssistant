'use strict';

const ssml = (template, ...inputs) => {
  // Generate the raw escaped string
  const raw = template.reduce((out, str, i) => i
    ? out + (
      inputs[i - 1]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    ) + str
    : str
  );
  // Trim out new lines at the start and end but keep indentation
  const trimmed = raw
    .replace(/^\s*\n(\s*)<speak>/, '$1<speak>')
    .replace(/<\/speak>\s+$/, '</speak>');
  // Remove extra indentation
  const lines = trimmed.split('\n');
  const indent = /^\s*/.exec(lines[0])[0];
  const match = new RegExp(`^${indent}`);
  return lines.map((line) => line.replace(match, '')).join('\n');
};

module.exports = {ssml};
