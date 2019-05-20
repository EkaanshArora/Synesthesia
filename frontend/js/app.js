var MidiPlayer = MidiPlayer;
var loadFile, loadDataUri, Player;
var AudioContext = window.AudioContext || window.webkitAudioContext || false;
var ac = new AudioContext || new webkitAudioContext;
var eventsDiv = document.getElementById('events');

var changeTempo = function (tempo) {
	Player.tempo = tempo;
}

var play = function () {
	Player.play();
	document.getElementById('play-button').innerHTML = 'Pause';
}

var pause = function () {
	Player.pause();
	document.getElementById('play-button').innerHTML = 'Play';
}

var stop = function () {
	Player.stop();
	document.getElementById('play-button').innerHTML = 'Play';
}

var buildTracksHtml = function () {
	Player.tracks.forEach(function (item, index) {
		var trackDiv = document.createElement('div');
		trackDiv.id = 'track-' + (index + 1);
		var h5 = document.createElement('h5');
		h5.innerHTML = 'Track ' + (index + 1);
		var code = document.createElement('code');
		trackDiv.appendChild(h5);
		trackDiv.appendChild(code);
		eventsDiv.appendChild(trackDiv);
	});
}

Soundfont.instrument(ac, 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite/acoustic_guitar_nylon-mp3.js').then(function (instrument) {
	document.getElementById('loading').style.display = 'none';
	document.getElementById('select-file').style.display = 'block';

	loadFile = function () {
		var file = document.querySelector('input[type=file]').files[0];
		var reader = new FileReader();
		if (file) reader.readAsArrayBuffer(file);

		eventsDiv.innerHTML = '';

		reader.addEventListener("load", function () {
			Player = new MidiPlayer.Player(function (event) {
				if (event.name == 'Note on') {
					instrument.play(event.noteName, ac.currentTime, { gain: event.velocity / 100 });
					//document.querySelector('#track-' + event.track + ' code').innerHTML = JSON.stringify(event);
				}

				document.getElementById('tempo-display').innerHTML = Player.tempo;
				document.getElementById('file-format-display').innerHTML = Player.format;
				document.getElementById('play-bar').style.width = 100 - Player.getSongPercentRemaining() + '%';
			});

			Player.loadArrayBuffer(reader.result);

			document.getElementById('play-button').removeAttribute('disabled');

			//buildTracksHtml();
			play();
		}, false);
	}

	loadDataUri = function (dataUri) {
		Player = new MidiPlayer.Player(function (event) {
			if (event.name == 'Note on' && event.velocity > 0) {
				instrument.play(event.noteName, ac.currentTime, { gain: event.velocity / 100 });
				//document.querySelector('#track-' + event.track + ' code').innerHTML = JSON.stringify(event);
				//console.log(event);
			}

			document.getElementById('tempo-display').innerHTML = Player.tempo;
			document.getElementById('file-format-display').innerHTML = Player.format;
			document.getElementById('play-bar').style.width = 100 - Player.getSongPercentRemaining() + '%';
		});

		Player.loadDataUri(dataUri);

		document.getElementById('play-button').removeAttribute('disabled');

		//buildTracksHtml();
		play();
	}

	loadDataUri(mario);
});

var mario = 'data:audio/midi;base64,TVRoZAAAAAYAAAABAIBNVHJrAAAAsACQMH+BAIAwWgCQM39AgDNaAJA3f0CAN1oAkDp/gQCAOloAkD5/gQCAPloAkDN/gQCAM1oAkDd/QIA3WgCQOn9AgDpaAJA3f4EAgDdaAJA6f4EAgDpaAJAyf4EAgDJaAJA1f0CANVoAkDl/QIA5WgCQM3+BAIAzWgCQNn+BAIA2WgCQMH+BAIAwWgCQM39AgDNaAJA3f0CAN1oAkDh/gQCAOFoAkDx/gQCAPFoA/y8A';
