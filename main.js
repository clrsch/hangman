'use strict'
const maxLevel = 30;
const timerZeitInSec = 120;
const maxLength = 35;
var liste = "alk"

var input;
var level = 10;//parseInt(localStorage.getItem('savedLevel'));
var score = 0;//parseInt(localStorage.getItem('savedScore'));
var winCounter,
	failCounter = 0;
var newMaxLength = maxLength;
var firstButtonPressed = false;
var timerStop = false;
var versuchsZeit = 0;
var usedWords = [];
var keys = [
	'Q',
	'W',
	'E',
	'R',
	'T',
	'Z',
	'U',
	'I',
	'O',
	'P',
	'Ü',
	'A',
	'S',
	'D',
	'F',
	'G',
	'H',
	'J',
	'K',
	'L',
	'Ö',
	'Ä',
	'Y',
	'X',
	'C',
	'V',
	'B',
	'N',
	'M'
];
var keysPressed = [];

function init() {
	var hasBeenLaunched = localStorage.getItem('hasBeenLaunched');
	setPolizeiPosition();
	if (!hasBeenLaunched || hasBeenLaunched === false) {
		meldung(0);
		localStorage.setItem('hasBeenLaunched', true);
	}
	timerStop = true;
	score = 0;
	document.getElementById('timer').innerHTML = '';
	
	level = 10;
	newMaxLength = maxLength;
	liste = document.getElementById("listenauswahl").value;

	document.getElementById('level').innerHTML = 'Level ' + level / 10;
	document.getElementById('score').innerHTML = score + ' Punkte';
	
	resetGame();
	startGame();
}

function resetGame() {
	for (var i = 0; i < keys.length; i++) {
		document.getElementById(keys[i] + 'key').disabled = false;
		keysPressed[i] = 0;
	}
	winCounter = 0;
	failCounter = 0;

	setIp();

	setPolizeiPosition();
}

function startGame() {
	resetGame();
	input = getWord(liste).replace('\r', '');

	// newMaxLength = Math.floor((newMaxLength-(newMaxLength/4))) - ((level / 10) * 2 - 2);
	// console.log("newMaxLength: "+newMaxLength)
	// while (input.length > newMaxLength || input.length <= newMaxLength - 2) {
	// 	input = getWord().replace('\r', '');
	// 	if (input.length > maxLength) {
	// 		console.log("INPUT.LENGTH: "+input.length)
	// 		break;
	// 	}
	// }

	while (usedWords.includes(input)) {
		input = getWord(liste).replace('\r', '');
	}
	usedWords.push(input);

	generateInputSpans();
	inputToHangman(input);
	versuchsZeit = 0;
	firstButtonPressed = false;
}

function eliminate(buchstabe) {
	var index = input.indexOf(buchstabe);
	keysPressed[keys.indexOf(buchstabe)]++; //mitzählen, wie oft ein Buchstabe schon eliminiert wurde
	if (document.getElementById(buchstabe + 'key') != undefined) {
		//Tastatureingabe-Validität per DOM-Abfrage
		if (firstButtonPressed == false) {
			if (level == 10) {
				timerStop = false;
				startTimer(timerZeitInSec);
			}
			firstButtonPressed = true;
		}
		if (index == -1) {
			failCounter++;
			polizeiKommtNaeher();
		} else {
			while (index != -1) {
				index = input.indexOf(buchstabe, index);
				if (index != -1 && document.getElementById('input' + (index + 1) + 'inner') != null) {
					document.getElementById('input' + (index + 1) + 'inner').style.visibility = 'visible';
					if (keysPressed[keys.indexOf(buchstabe)] == 1) {
						winCounter++;
					}
					index++;
				}
			}
		}
		if (keysPressed[keys.indexOf(buchstabe)] == level / 10) {
			document.getElementById(buchstabe + 'key').disabled = true;
		}
	}
	checkWin();
}

function checkWin() {
	var punkte = (10 - failCounter) * (timerZeitInSec-versuchsZeit);
	if (winCounter == input.length) {
		Swal.fire({
			title: 'Richtig!',
			html: input + ' war richtig.<br>Du hast '+(timerZeitInSec-versuchsZeit)+' x ' + (10 - failCounter) + ' = ' + punkte + ' Punkte erreicht!',
			icon: 'success',
			confirmButtonText: 'Weiter'
		});
		score = score + punkte;
		if (level < maxLevel) {
			
			level = level + 10;
			meldung(level/10);
			document.getElementById('level').innerHTML = 'Level ' + level / 10;
			startGame();
		} else {
			Swal.fire({
				title: 'Level ' + maxLevel / 10 + ' gemeistert!',
				html: input+' war richtig!<br>Punktestand: ' + score,
				icon: 'success',
				confirmButtonText: 'Weiter'
			});
			init();
		}
		localStorage.setItem('savedLevel', level);
		localStorage.setItem('savedScore', score);
	}
	if (failCounter == 10) {
		Swal.fire({
			title: 'Verloren!',
			text: 'Leider verloren, die Lösung wäre ' + input + ' gewesen!',
			icon: 'error',
			confirmButtonText: 'Weiter'
		});
		init();
	}
}

function ownWord() {
	var Leerzeichen = 0;
	var unsanitized = window.prompt('Wort eingeben (max. 14 Zeichen):', '');
	while (unsanitized.length > maxLength) {
		unsanitized = window.prompt('Das waren mehr als 14 Zeichen! Bitte erneut eingeben:', '');
	}
	if (unsanitized.indexOf(' ') != -1) {
		Leerzeichen++;
		if (unsanitized.indexOf(' ', unsanitized.indexOf(' ') + 1) > -1 && Leerzeichen > 0) {
			Leerzeichen++;
			while (
				unsanitized.indexOf(' ', unsanitized.indexOf(' ', unsanitized.indexOf(' ') + 1) + 1) > -1 &&
				Leerzeichen > 0
			) {
				unsanitized = window.prompt('Eingabe darf max. 2 Leerzeichen enthalten! Bitte erneut eingeben:', '');
			}
		}
	}
	while (unsanitized.length < 2) {
		unsanitized = window.prompt('1 Buchstasdabe ist kein Wort! Bitte erneut eingeben:', '');
	}

	resetGame();
	input = unsanitized.toUpperCase();
	inputToHangman(input);
}

function polizeiKommtNaeher() {
	document.getElementById('move_Weidenauer_Straße').setAttribute('style', 'display:inherit');
}