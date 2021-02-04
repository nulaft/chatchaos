const wordDisplay = document.getElementById("word-display");
const statusElement = document.getElementById("status");
const toggleVisButton = document.getElementById("toggleVisBttn");
const wordInput = document.getElementById("word-input");
const randomLetterCount = document.getElementById("random-quantity");
const validChars = /^[A-Z]+$/;

const params = new URLSearchParams(window.location.search);
const channel = params.get('channel') || 'JH_Code';

var hiddenWord = '';
var foundChars = [];
var randomWords = [];

const client = new tmi.Client({
    connection: {
        secure: true,
        reconnect: true,
    },
    channels: [channel],
});

function importRandomWords(quantity) {
    randomWords = [];
    fetch('assets/words.json').then(r => r.text()).then(data => {
        const jsonFile = JSON.parse(data);
        for (let wordLength = 0; wordLength <= 15; wordLength++) {
            randomWords.push([]);
            if (jsonFile[`length_${wordLength}`]){
                var words = jsonFile[`length_${wordLength}`];
                for (let i = 0; i < quantity; i++) {
                    var randLineNum = Math.floor(Math.random() * words.length);
                    randomWords[wordLength].push(words[randLineNum]);
                }
            }
        }
    });
}

function changeRandomValue(amount) {
    try {
        var amountInt = parseInt(randomLetterCount.innerText) + amount;
        if ((amountInt <= 15) && (amountInt >= 4)) {
            randomLetterCount.innerText = amountInt;
        }

    } catch (error) {
        console.log(error);
        randomLetterCount.innerText = 5;
    }
}

function setRandomWord() {
    try {
        var amountInt = parseInt(randomLetterCount.innerText);
        if (!((amountInt <= 15) && (amountInt >= 4))) {
            randomLetterCount.innerText = 5;
            amountInt = 5;
        }
        if (randomWords[amountInt].length === 0) {
            alert("Please refresh the page to load more random words");
        } else {
            setWord(randomWords[amountInt].pop());
        }
    } catch (error) {
        console.log(error);
        randomLetterCount.innerText = 5;
    }
}

function displayWord() {
    var obscuredWord = '';
    for (let i = 0; i < hiddenWord.length; i++) {
        if (foundChars.includes(hiddenWord[i])) {
            obscuredWord = obscuredWord.concat(hiddenWord[i]);
        } else obscuredWord = obscuredWord.concat("_");
        if (i < hiddenWord.length - 1) obscuredWord = obscuredWord.concat(" ");
    }
    wordDisplay.innerText = obscuredWord;
    if (!obscuredWord.includes("_")) {
        wordDisplay.innerText = hiddenWord;
        wordDisplay.style.color = "#2ecc71";
    }
}

function guessLetter(letter) {
    if ((!foundChars.includes(letter.toUpperCase()) && (letter.length === 1) && (validChars.test(letter.toUpperCase())))) {
        foundChars.push(letter.toUpperCase());
        displayWord();
    }
}

function setWord(word) {
    if (!word) word = wordInput.value;
    if ((word.length > 3) && (word.length <= 15)) {
        if (validChars.test(word.toUpperCase())) {
            foundChars = [];
            hiddenWord = word.toUpperCase();
            console.log(`Word Set: ${hiddenWord}`);
            wordDisplay.style.color = "#ffffff";
            displayWord();
        } else alert("Word can only contain letters");
    } else alert("Word length must be between 3 and 15 characters (Yes there is a limit)");
}

function toggleVis() {
    if (wordInput.type === "password") {
        wordInput.type = "text";
        toggleVisButton.value = "Hide";
    } else {
        wordInput.type = "password";
        toggleVisButton.value = "Show";
    }
}

client.connect().then(() => {
    statusElement.innerHTML = `Connected to: <span style="font-weight: bold">${channel}</span>`;
});

client.on('message', (channel, tags, message, self) => {
    if (self || !message.startsWith('!')) {
        return;
    }

    const args = message.slice(1).split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'guess' && args.length === 1) {
        console.log(`Guess made (${tags.username}): ${args[0]}`);
        guessLetter(args[0]);
    }
});

importRandomWords(20);