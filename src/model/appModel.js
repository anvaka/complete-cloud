import request from '../lib/request.js';
//import WebFont from 'webfontloader';

const excludeList = new Set([
  'a', 'the', 'and', 'but','of', 'to', 'for', 'an', 'so', 'in', 'at', 'on', 'as',
  'or',
  'it', 'its', 'is', 'by', 'was', 'be', 'are', 'you', 'your', 'had', 'i', 'have'
]);

const endpoint = 'https://anvaka.github.io/wpg-data/world/';
const appModel = {
  questions: [],
  selected: ''
};

var fontsReady = true;
var queriesResponse;

// WebFont.load({
//   google: {
//     families: ['Roboto']
//   },
//   fontactive() {
//     fontsReady = true
//     console.log('activating..');
//     setTimeout(activateModelIfNeeded, 30)
//   }
// });
//

request(endpoint + 'index.json')
  .then(allFiles => request(endpoint + last(allFiles)))
  .then(setOnModel);

export default appModel;

function last(array) {
  return array[array.length - 1];
}

function activateModelIfNeeded() {
  if (fontsReady && queriesResponse) {
    appModel.questions = Object.keys(queriesResponse).map(key => toUIModel(queriesResponse[key], key))
    appModel.selected = appModel.questions[0].key;
  }
}

function setOnModel(response) {
  queriesResponse = response;
  activateModelIfNeeded();
}

function toUIModel(query, key) {
  return {
    key,
    display: query.display,
    words: collectWords(query.records)
  }
}

function collectWords(records) {
  var count = new Map();
  var maxCount = 0;
  var maxFontSize = 100;
  records.forEach(r => r.suggestions.forEach(extractText))

  return Array.from(count).map(toScaled);

  function toScaled(pair) {
    return [pair[0], Math.ceil(maxFontSize * pair[1]/maxCount)]
  }

  function extractText(suggestion) {
    var suggestionRegex = /<b>\s*(.+?)\s*<\/b>/g; // they put them in <b> </b> tag
    var match;
    do {
      match = suggestionRegex.exec(suggestion);
      var completion = match && match[1]
      if (completion) {
        completion.split(' ').forEach(addWord);
      }
    } while (match)
  }

  function addWord(word) {
    if (excludeList.has(word)) return;

    word = word.replace('&#39;', '\'');
    var counts = (count.get(word) || 0) + 1;
    if (counts > maxCount) maxCount = counts;
    count.set(word, counts)
  }
}
