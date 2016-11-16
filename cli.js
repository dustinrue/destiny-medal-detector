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
    medalDetector(sourceFile);
  }
  catch(e) {
    console.log(e.message);
  }
  
}

