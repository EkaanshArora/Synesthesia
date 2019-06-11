const Jimp = require("jimp");
const scribble = require("scribbletune");
const express = require("express");
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    cb(null, "" + Date.now());
  }
});

var upload = multer({ storage: storage });
const notes = [];
const fs = require("fs");
let pattern = "",
  resizeFactor = 8,
  color = [[], [], []],
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
  progressionNotesMaster = ["i", "ii", "iii", "VI", "v", "VII", "III", "i"],
  progressionNotes,
  calculatedProgression = "",
  songRender = "",
  uploadedImage;

var app = express();
app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  console.log(Date.now());
  res.render("index");
});

app.post("/", upload.single("image"), function(req, res) {
  var calc7 = function(toCalculate){
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
  uploadedImage = req.file.path;
  Jimp.read(uploadedImage).then(image => {
    image
      .resize(resizeFactor, resizeFactor) // resize
      .quality(80) // set JPEG quality
      .write(uploadedImage+"t", (err, image) => {
        Jimp.read(uploadedImage+"t")
          .then(image => {
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(
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
            });
            colorSum = redSum + blueSum + greenSum;
            imageBrightness = colorSum / (resizeFactor * resizeFactor * 256 * 3);
            redPercent = redSum / (resizeFactor * resizeFactor * 256);
            greenPercent = greenSum / (resizeFactor * resizeFactor * 256);
            bluePercent = blueSum / (resizeFactor * resizeFactor * 256);
            scaleSelector = (bluePercent - redPercent) / 2;
            scaleSelector = scaleSelector / (Math.abs(scaleSelector) + greenPercent);
            chosenScale = calc7(scaleSelector);
            console.log(chosenScale);
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
            progressionNotes = Array.from(progressionNotesMaster);
            for (var i = progressionNotes.length - 1; i >= 0; i--) {
              calculatedProgression =
                calculatedProgression +
                " " +
                progressionNotes.splice(
                  Math.floor(Math.random() * progressionNotes.length),
                  1
                );
            }
            calculatedProgression = calculatedProgression.slice(1);
            console.log(calculatedProgression);
            const chords = scribble.progression.getChords(
              chosenScale + chosenPitch + " major",
              "VII ii III v I vi II VI"//calculatedProgression
            ); //i iii ii v i VI III VII
            chords.split(" ").forEach((c, i) => {
              const chord = scribble.chord(c);
              if (i % 2 !== 0) {
                // use 2 quarter notes
                notes.push(chord[0]);
                notes.push(chord[1]);
                pattern = pattern + "xx";
              } else {
                // use a quarter note and 2 eigth notes
                notes.push(chord[0]);
                notes.push(chord[1]);
                notes.push(chord[2]);
                pattern = pattern + "x[xx]";
              }
            });
            const clip1 = scribble.clip({
              notes,
              pattern: pattern
            });
            scribble.midi(clip1, "clip.mid", function() {
              songRender =
                "data:audio/midi;base64," +
                Buffer(fs.readFileSync("clip.mid")).toString("base64");
              res.render("play", { mario: songRender });
              calculatedProgression = "";
              fs.unlink(uploadedImage, (err) => {
                if (err) throw err;
                console.log('1 was deleted');
              });
              fs.unlink(uploadedImage+"t", (err) => {
                if (err) throw err;
                console.log('2 was deleted');
              });
            });
          })
          .catch(err => {
            console.error(err);
          });
      });
  });
});

app.listen(3000, function() {
  console.log("Listening at 3000");
});
