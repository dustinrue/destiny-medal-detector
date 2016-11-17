#!/usr/bin/env node
var medalDetector = require('destiny-medal-detector');

var sourceFile = '';


process.argv.forEach(function (val, index, array) {
  if (index == 2) {
    sourceFile = val;
  }
});


if (sourceFile == '') {
  console.log("No sourcefile");
}
else {
  try {
    var medals = medalDetector.medals();
    medalDetector.detectMedals(sourceFile, medals, function(matchedMedals) {
      console.log(matchedMedals.join(", "));
    });
  }
  catch(e) {
    console.log(e.message);
  }
  
}

