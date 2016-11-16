var fs = require('fs');
var ffmpeg = require('ffmpeg');
var resemble = require('node-resemble');
var tmp = require('tmp');
var sourceFile = '';

var searchMedal = function(frame, callback) {
  var medals = [
    "Triple Down.png", 
    "Double Down.png", 
    "Merciless.png", 
    "Bullseye.png",
    "Scout's Honor.png", 
    //"At Any Cost.png", 
    //"Get it Off!.png",
    "Gutted.png",
    //"Uprising.png",
    "Breaker.png",
    //"Gutted2.png",
    "Slayer.png"
  ];

  medals.forEach(function(medal_file_name) {
    var github_img1 = fs.readFileSync(frame);
    var medal = fs.readFileSync(__dirname + '/medals/destiny1/' + medal_file_name);

    var diff = resemble(github_img1).compareTo(medal).onComplete(function(data){
      if (data.misMatchPercentage < 35) {
        var confidence = 100 - data.misMatchPercentage;
          callback(medal_file_name, confidence);
        }
      });
    });
}

var medalDetector = function(sourceFile) {
  sourceFile = fs.realpathSync(sourceFile);
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
            searchMedal(tmpDir.name + '/' + item, function(medal, confidence) {
              console.log("Frame " + item + " contains " + medal + " confidence " + confidence + "%");              
            });
          })
        });
      });
    });
  }
  else {
    throw new Error("Invalid source file");
  }
}

module.exports = medalDetector;