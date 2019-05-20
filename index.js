const Jimp = require('jimp');
const scribble = require('scribbletune');
const notes = [];
const fs = require('fs')
let pattern = '';
let resizeFactor = 25;
let color = [[], [], []];
let redSum = 0, greenSum = 0, blueSum = 0, colorSum = 0, imageBrightness = 0, maxColor = 0, redPercent = 0, greenPercent = 0, bluePercent = 0, chordSelector = 0, chosenChord, chosenScale;
let progressionNotes = ["i", "ii", "iii", "VI", "v", "VII", "III", "i"];
let calculatedProgression = "";
let songRender="";
Jimp.read('test.jpg')
    .then(image => {
        image
            .resize(resizeFactor, resizeFactor) // resize
            .quality(80) // set JPEG quality
            .write('comp.jpg', (err, image) => {
                Jimp.read('comp.jpg')
                    .then(image => {
                        image
                            .scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
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
                        chordSelector = (bluePercent - redPercent) / 2;
                        chordSelector = chordSelector / (Math.abs(chordSelector) + greenPercent);
                        console.log(imageBrightness + " " + redPercent + " " + greenPercent + " " + bluePercent + " CS " + chordSelector);
                        if (chordSelector <= -0.715) {
                            chosenChord = 'A';
                        }
                        else if (chordSelector <= -0.43) {
                            chosenChord = 'B';
                        }
                        else if (chordSelector <= -0.145) {
                            chosenChord = 'C';
                        }
                        else if (chordSelector <= .14) {
                            chosenChord = 'D';
                        }
                        else if (chordSelector <= .425) {
                            chosenChord = 'E';
                        }
                        else if (chordSelector <= .71) {
                            chosenChord = 'F';
                        }
                        else {
                            chosenChord = 'G';
                        }
                        if (imageBrightness < 0.3) {
                            chosenScale = 2;
                        }
                        else if (imageBrightness < .5) {
                            chosenScale = 3;
                        }
                        else if (imageBrightness < .7) {
                            chosenScale = 4;
                        }
                        else if (imageBrightness < .8) {
                            chosenScale = 5;
                        }
                        else {
                            chosenScale = 6;
                        }
                        console.log(chosenChord + chosenScale);
                        for (var i = progressionNotes.length - 1; i >= 0; i--) {
                            calculatedProgression = calculatedProgression + " " + progressionNotes.splice(Math.floor(Math.random() * progressionNotes.length), 1);
                        }
                        calculatedProgression = calculatedProgression.slice(1);
                        console.log(calculatedProgression);
                        const chords = scribble.progression.getChords(chosenChord + chosenScale + ' minor', calculatedProgression); //i iii ii v i VI III VII
                        chords.split(' ').forEach((c, i) => {
                            const chord = scribble.chord(c);
                            if (i % 2 !== 0) {
                                // use 2 quarter notes
                                notes.push(chord[0]);
                                notes.push(chord[1]);
                                pattern = pattern + 'xx'
                            } else {
                                // use a quarter note and 2 eigth notes
                                notes.push(chord[0]);
                                notes.push(chord[1]);
                                notes.push(chord[2]);
                                pattern = pattern + 'x[xx]'
                            }
                        });
                        const clip1 = scribble.clip({
                            notes,
                            pattern: pattern
                        });
                        scribble.midi(clip1, 'clip.mid',function(){
                            console.log('data:audio/midi;base64,' + Buffer(fs.readFileSync('clip.mid')).toString('base64'));
                            songRender='data:audio/midi;base64,' + Buffer(fs.readFileSync('clip.mid')).toString('base64');
                        });
                    })
                    .catch(err => {
                        console.error(err);
                    });
            })
    })
