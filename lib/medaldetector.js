var fs = require('fs');
var ffmpeg = require('ffmpeg');
var resemble = require('node-resemble');
var tmp = require('tmp');
var sourceFile = '';

// returns the default list of medals we know about
// passing in a smaller list of medals will result
// in the detection of just the provided medals
var medals = function() {
  return new Array(
    "Triple Down", 
    "Double Down", 
    "Merciless", 
    "Bullseye",
    "Scout's Honor", 
    //"At Any Cost", 
    //"Get it Off!",
    "Gutted",
    //"Uprising",
    "Breaker",
    //"Gutted2",
    "Slayer"
  );
}

var _searchMedal = function(frameFileName, medals, matchedMedals) {
  medals.forEach(function(medalName) {
    var medalFileName = __dirname + '/medals/destiny1/' + medalName + ".png";

    if (!fs.existsSync(frameFileName)) {
      throw new Error("Source files went away!");
    }
    var frameData = fs.readFileSync(frameFileName);
    
    if (fs.existsSync(medalFileName)) {
      var medalData = fs.readFileSync(medalFileName);
      var diff = resemble(frameData).compareTo(medalData).onComplete(function(data){
        if (data.misMatchPercentage < 35) {
          var confidence = 100 - data.misMatchPercentage;
          if (!matchedMedals.includes(medalName)) {
            matchedMedals.push(medalName);
          }
        }
      });
    }
    else {
      console.log("Unable to check for " + medalName);
    }
  }); 
}

var detectMedals = function(sourceFile, medals, callback) {
  sourceFile = fs.realpathSync(sourceFile);
  var matchedMedals = new Array();
  var tmpDir = tmp.dirSync();
  if (fs.existsSync(sourceFile)) {
    // works for DVR clips after March of 2016
    // ffmpeg -i "${SOURCE_FILE}"  -vf fps=10,crop="53:43:611:153" -f image2 "${DEST_DIR}/frame-%07d.png"
    ffmpeg(sourceFile, function(err, video) {
      video.addCommand('-vf', 'fps=10,crop="53:43:611:153"');
      video.addCommand('-f', 'image2 ' + tmpDir.name + '/frame-%07d.png');
      video.save('', function(err, file) {
        fs.readdir(tmpDir.name, function(err, items) {
          items.forEach(function(item) {
            _searchMedal(tmpDir.name + '/' + item, medals, matchedMedals);
          });
          callback(matchedMedals);
        });
      });
    });
  }
  else {
    throw new Error("Invalid source file");
  }

}

module.exports = {
  detectMedals,
  medals
}