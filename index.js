const Jimp = require("jimp");
const scribble = require("scribbletune");
const express = require("express");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, "" + Date.now());
  }
});

var upload = multer({ storage: storage });
const fs = require("fs");
let pattern = "",
  notes = [],
  resizeFactor = 12,
  color = [[], [], []],
  phraseChord = [],
  phraseNature = [],
  phrasePace = [],
  tempRedSum = 0,
  tempGreenSum = 0,
  tempBlueSum = 0,
  redSum = 0,
  greenSum = 0,
  blueSum = 0,
  colorSum = 0,
  imageBrightness = 0,
  redPercent = 0,
  greenPercent = 0,
  bluePercent = 0,
  scaleSelector = 0,
  chosenScale,
  chosenPitch,
  loopCount = 0,
  songRender = "",
  uploadedImage;

var app = express();
app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  console.log(Date.now());
  res.render("index");
});

app.post("/", upload.single("image"), function (req, res) {

  var cleanUp = function () {
    phraseChord = [];
    phraseNature = [];
    phrasePace = [];
    pattern = "";
    chords = "";
    resizeFactor = 12;
    color = [[], [], []];
    tempRedSum = 0;
    tempGreenSum = 0;
    tempBlueSum = 0;
    redSum = 0;
    greenSum = 0;
    blueSum = 0;
    colorSum = 0;
    imageBrightness = 0;
    redPercent = 0;
    greenPercent = 0;
    bluePercent = 0;
    scaleSelector = 0;
    loopCount = 0;
    songRender = "";
    notes = [];
  };

  var calc7 = function (toCalculate) {
    if (toCalculate <= -0.715) {
      return Calculated = "A";
    } else if (toCalculate <= -0.43) {
      return Calculated = "B";
    } else if (toCalculate <= -0.145) {
      return Calculated = "C";
    } else if (toCalculate <= 0.14) {
      return Calculated = "D";
    } else if (toCalculate <= 0.425) {
      return Calculated = "E";
    } else if (toCalculate <= 0.71) {
      return Calculated = "F";
    } else {
      return Calculated = "G";
    }
  };

  var convertRed = function (toCalculate) {
    if (toCalculate <= 0.142) {
      return Calculated = "I";
    } else if (toCalculate <= 0.284) {
      return Calculated = "II";
    } else if (toCalculate <= 0.426) {
      return Calculated = "III";
    } else if (toCalculate <= 0.568) {
      return Calculated = "IV";
    } else if (toCalculate <= 0.710) {
      return Calculated = "V";
    } else if (toCalculate <= 0.852) {
      return Calculated = "VI";
    } else {
      return Calculated = "VII";
    }
  };

  var convertGreen = function (toCalculate) {
    if (toCalculate <= 0.5) {
      return Calculated = 0;
    } else {
      return Calculated = 1;
    }
  };

  var convertBlue = function (toCalculate) {
    if (toCalculate <= 0.35) {
      return Calculated = 0;
    } else if (toCalculate <= 0.7) {
      return Calculated = 1;
    } else {
      return Calculated = 2;
    }
  };

  uploadedImage = req.file.path;

  Jimp.read(uploadedImage).then(image => {
    cleanUp();
    console.log("clean");
    image
      .resize(resizeFactor, resizeFactor)
      .quality(80)
      .write(uploadedImage + "t", (err, image) => {
        Jimp.read(uploadedImage + "t")
          .then(image => {
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (
              x,
              y,
              idx
            ) {
              var red = this.bitmap.data[idx + 0];
              redSum += red;
              var green = this.bitmap.data[idx + 1];
              greenSum += green;
              var blue = this.bitmap.data[idx + 2];
              blueSum += blue;
              color[0].push(red);
              color[1].push(green);
              color[2].push(blue);
              if (x === image.bitmap.width - 1) {
                for (i = 0; i < image.bitmap.width; i++) {
                  tempRedSum = tempRedSum + color[0][image.bitmap.width * loopCount + i];
                  tempGreenSum = tempGreenSum + color[1][image.bitmap.width * loopCount + i];
                  tempBlueSum = tempBlueSum + color[2][image.bitmap.width * loopCount + i];
                }
                tempRedSum = tempRedSum / image.bitmap.width;
                tempRedSum = tempRedSum / 256;
                tempGreenSum = tempGreenSum / image.bitmap.width;
                tempGreenSum = tempGreenSum / 256;
                tempBlueSum = tempBlueSum / image.bitmap.width;
                tempBlueSum = tempBlueSum / 256;

                phraseChord.push(convertRed(tempRedSum));
                phraseNature.push(convertGreen(tempGreenSum));
                phrasePace.push(convertBlue(tempBlueSum));

                tempRedSum = 0;
                tempGreenSum = 0;
                tempBlueSum = 0;
                loopCount++;
              }
            });

            for (var i = 0; i < phraseChord.length; i++) {
              if (phraseNature[i] === 1) {
                phraseChord[i] = phraseChord[i].toLowerCase();
              }
            };

            colorSum = redSum + blueSum + greenSum;
            imageBrightness = colorSum / (resizeFactor * resizeFactor * 256 * 3);
            redPercent = redSum / (resizeFactor * resizeFactor * 256);
            greenPercent = greenSum / (resizeFactor * resizeFactor * 256);
            bluePercent = blueSum / (resizeFactor * resizeFactor * 256);
            scaleSelector = (bluePercent - redPercent) / 2;
            scaleSelector = scaleSelector / (Math.abs(scaleSelector) + greenPercent);
            chosenScale = calc7(scaleSelector);

            if (imageBrightness < 0.3) {
              chosenPitch = 2;
            } else if (imageBrightness < 0.5) {
              chosenPitch = 3;
            } else if (imageBrightness < 0.7) {
              chosenPitch = 4;
            } else if (imageBrightness < 0.8) {
              chosenPitch = 5;
            } else {
              chosenPitch = 6;
            }

            console.log(chosenScale + chosenPitch);
            let chords = scribble.progression.getChords(
              chosenScale + chosenPitch + " major",
              phraseChord.join(" ")
            ); //i iii ii v i VI III VII

            chords.split(" ").forEach((c, i) => {
              const chord = scribble.chord(c);
              if (phrasePace[i] === 0) {
                // use 2 quarter notes
                notes.push(chord[0]);
                notes.push(chord[1]);
                pattern = pattern + "xx";
              } else if (phrasePace[i] === 1) {
                // use a quarter note and 2 eigth notes
                notes.push(chord[0]);
                notes.push(chord[1]);
                notes.push(chord[2]);
                pattern = pattern + "x[xx]";
              } else {
                // use 2 eigth?
                notes.push(chord[0]);
                notes.push(chord[1]);
                notes.push(chord[2]);
                notes.push(chord[0]);
                pattern = pattern + "[xx][xx]";
              }
            });
            console.log(pattern + "  " + phraseChord.join(" "));
            let clip1 = scribble.clip({
              notes,
              pattern: pattern
            });
            scribble.midi(clip1, uploadedImage+".mid", function () {
              songRender =
                "data:audio/midi;base64," +
                Buffer(fs.readFileSync(uploadedImage+".mid")).toString("base64");
              res.render("play", { mario: songRender });
              // fs.unlink(uploadedImage, (err) => {
              //   if (err) throw err;
              //   console.log('1 was deleted');
              // });
              fs.unlink(uploadedImage + "t", (err) => {
                if (err) throw err;
                console.log('2 was deleted');
              });
              fs.unlink(uploadedImage+".mid", (err) => {
                if (err) throw err;
                console.log('clip was deleted');
              });
            });
          })
          .catch(err => {
            console.error(err);
          });
      });
  });
});

app.listen(3000, function () {
  console.log("Listening at 3000");
});
