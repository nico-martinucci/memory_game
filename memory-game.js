"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */

let howToButton = document.querySelector("#how-to");

howToButton.addEventListener("click", event => {
  event.preventDefault();
  alert(`
    1. Enter an even-numbered board size from 2-40
    2. Click the button to start a new game
    3. Click on the cards to reveal their colors - only two cards can be 
    face up at a time, and if they are a match they will remain face up
    4. If two face up cards are not a match, they will turn back over after
    1 second
    5. Try to get a high score!`)
})

const FOUND_MATCH_WAIT_MSECS = 1000;
const COLOR_OPTIONS = [
  "red",
  "blue",
  "green",
  "orange",
  "purple",
  "pink",
  "black",
  "gray",
  "yellow",
  "chartreuse",
  "mediumvioletred",
  "coral",
  "darkkhaki",
  "fuchsia",
  "lightseagreen",
  "steelblue",
  "midnightblue",
  "maroon",
  "darkslategray",
  "ivory",
];

let boardSizeInput = document.querySelector("input[name='board-size']");
let startButton = document.querySelector("#start-button");
let colors;

/**
 * listener for start button click at the top of page; only shows up on full refresh,
 * all other game start logic happens on the reset button
 */
startButton.addEventListener("click", (event) => {
  event.preventDefault();
  if (checkBoardSizeInput()) {
    colors = generateBoard();
    adjustBoardWidth();
    startGame();
  }
});

/**
 * checks to make sure the inputed value for board size is even and between 2 and 20;
 * gives an alert if either of those is false
 * @returns - false if one or both conditions aren't met; true if between 2 and 20 and even
 */
function checkBoardSizeInput() {
  if (boardSizeInput.value % 2 !== 0) {
    alert("Entered value must be an even number!");
    boardSizeInput.value = "";
    return false;
  } else if (boardSizeInput.value < 2 || boardSizeInput.value > 40) {
    alert("Entered value must be between 2 and 40 (inclusive)!");
    boardSizeInput.value = "";
    return false;
  }
  
  return true;
}

/**
 * chooses random colors, passes them to the shuffle function, and then passes
 * those along to the create cards method to make the final game board
 * @param {array} colorOptions - list of colors to choose from 
 * @returns - array of choosen colors, two-per and shuffled
 */
function generateBoard() {
  let colorOptions = JSON.parse(JSON.stringify(COLOR_OPTIONS));
  let pickedColors = [];

  for (let i = 0; i < boardSizeInput.value / 2; i++) {
    let randomIndex = Math.floor(Math.random() * colorOptions.length);
    let randomColor = colorOptions.splice(randomIndex, 1);
    pickedColors.push(randomColor, randomColor);
  }

  let colors = shuffle(pickedColors);
  createCards(colors);

  console.log(colorOptions.length)
  console.log(COLOR_OPTIONS.length);

  return colors;
}

let gameBoard = document.getElementById("game");

/**
 * adjusts the width of the game board depending on the user-inputed board size;
 * for boards 20 or less, tries to format it in nice, even rows; for greater than,
 * maximizes each row (8 max per row)
 */
function adjustBoardWidth() {
  if (boardSizeInput.value <= 20) {
    for (let i = 8; i >= 4; i--) {
      if (boardSizeInput.value % i === 0) {
        gameBoard.style.width = 150 * i + "px";
        break;
      }
    }
  } else {
    gameBoard.style.width = "1200px";
  }
}

/** Shuffle array items in-place and return shuffled array. */
function shuffle(items) {
  // This algorithm does a "perfect shuffle", where there won't be any
  // statistical bias in the shuffle (many naive attempts to shuffle end up not
  // be a fair shuffle). This is called the Fisher-Yates shuffle algorithm; if
  // you're interested, you can learn about it, but it's not important.

  for (let i = items.length - 1; i > 0; i--) {
    // generate a random index between 0 and i
    let j = Math.floor(Math.random() * i);
    // swap item at i <-> item at j
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

/** Create card for every color in colors (each will appear twice)
 *
 * Each div DOM element will have:
 * - a class with the value of the color
 * - a click event listener for each card to handleCardClick
 */
function createCards(colors) {
  const gameBoard = document.getElementById("game");

  let id = 0;

  for (let color of colors) {
    let newCard = document.createElement("div");
    newCard.setAttribute("class", color);
    newCard.setAttribute("id", id);
    newCard.setAttribute("match", "false");

    newCard.addEventListener("click", () => {
      if (newCard.getAttribute("match") === "false") {
        handleCardClick(newCard);
      }
    });

    gameBoard.append(newCard);
    id++;
  }
}

/** Flip a card face-up. */
function flipCard(card) {
  card.style.backgroundColor = card.getAttribute("class");
}

/** Flip a card face-down. */
function unFlipCard(card) {
  card.style.backgroundColor = "";
}

let guesses = 0;
let faceUpCards = 0;
let cardOne;
let cardTwo;
let matchedCards = 0;

/** Handle clicking on a card: this could be first-card or second-card. */
function handleCardClick(card) {
  if (faceUpCards === 0) {
    flipCard(card);
    cardOne = card;
    incrementCounters();
    updateScore();
  } else if (faceUpCards === 1) {
    flipCard(card);
    cardTwo = card;
    incrementCounters();
    updateScore();

    if (checkMatch()) {
      faceUpCards = 0;
      matchedCards += 2;
      cardOne.setAttribute("match", "true");
      cardTwo.setAttribute("match", "true");
      checkWinCondition();
    } else {
      setTimeout(() => {
        faceUpCards = 0;
        unFlipCard(cardOne);
        unFlipCard(cardTwo);
      }, FOUND_MATCH_WAIT_MSECS);
    }
  }
}

/**
 * helper function that increments the counters for number of face up cards and
 * for total number of guesses
 */
function incrementCounters() {
  faceUpCards++;
  guesses++;
}

/**
 * checks if the two currently face up cards are a match and returns
 * this assessment
 * @returns 
 */
function checkMatch() {
  let sameColor =
      cardOne.getAttribute("class") === cardTwo.getAttribute("class");
  let differentCard =
    cardOne.getAttribute("id") !== cardTwo.getAttribute("id");

  return sameColor && differentCard;
}

let resetButton = document.querySelector("#reset-button");
let endGame = document.querySelector("#end-game");
let gameTimer; // variable to store the setInterval() and later use to stop it
let timeElapsed = 0;
let timer = document.querySelector("#timer");

resetButton.addEventListener("click", (event) => {
  event.preventDefault();
  if (checkBoardSizeInput()) {
    // internal reset
    matchedCards = 0;
    guesses = 0;
    timeElapsed = 0;

    // display reset
    gameBoard.innerHTML = "";
    // resetButton.style.display = "none";
    endGame.style.display = "none";
    timer.textContent = "Time elapsed: 0";
    let cards = document.querySelectorAll("#game div");
    for (let card of cards) {
      card.style.backgroundColor = "";
    }
    updateScore();
    clearInterval(gameTimer);
    gameTimer = startGameTimer();

    // create new board
    colors = generateBoard();
    adjustBoardWidth();
  }
});

/** starts the game */
function startGame() {
  let stats = document.querySelector("#stats");
  gameBoard.style.display = "block";
  stats.style.display = "block";
  resetButton.style.display = "block";
  startButton.style.display = "none";
  gameTimer = startGameTimer();
}

/**
 * creates and starts a game timer, counting up in .1 s increments, to measure
 * the length of the game
 * @returns a new timer so it can be stopped once the last pair is matched
 */
function startGameTimer() {
  let newTimer = setInterval(() => {
    timeElapsed += 0.1;
    timer.textContent = `Time elapsed: ${Math.round(timeElapsed * 10) / 10}`;
  }, 100);

  return newTimer;
}

/**
 * updates the score on the page; called whenever a pair is matched
 */
function updateScore() {
  let scoreElem = document.querySelector("#score");
  scoreElem.textContent = `Guesses: ${guesses}`;
}

/**
 * checks if the game has been won by comparing length of original color
 * array to the number of matched cards; also resets the "match" property
 * of all cards to reset css styling; and records/updates scores
 */
function checkWinCondition() {
  if (colors.length === matchedCards) {
    let allCards = document.querySelectorAll("#game div");
    for (let card of allCards) {
      card.setAttribute("match", "");
    }
    recordScore();
    updateDisplayScores();
    resetButton.style.display = "block";
    endGame.style.display = "block";
    clearInterval(gameTimer);
  }
}

let highScores = {};

/**
 * recards scores by comparing stats from most recent game to current best 
 * scores stored in the high scores object (or creates a new set of scores
 * if a game of that board size has not been stored yet); called on a confirmed
 * win
 */
function recordScore() {
  if (colors.length in highScores) {
    highScores[colors.length].lowestGuesses = Math.min(
      guesses,
      highScores[colors.length].lowestGuesses
    );
    highScores[colors.length].lowestTime = Math.min(
      Math.round(timeElapsed * 10) / 10,
      highScores[colors.length].lowestTime
    );
  } else {
    highScores[colors.length] = {
      lowestGuesses: guesses,
      lowestTime: Math.round(timeElapsed * 10) / 10,
    };
  }
}

/**
 * creates and udpates score text area; called on confirmed win
 */
function updateDisplayScores() {
  let highScoresDisplay = document.querySelector("#high-scores");
  highScoresDisplay.innerHTML = "";
  for (let boardSize in highScores) {
    let newScoreDisplay = document.createElement("p");
    let guessesText = `${highScores[boardSize].lowestGuesses} Guesses`;
    let timesText = `${highScores[boardSize].lowestTime} Seconds`;
    let scoreText = `${boardSize} Cards: ${guessesText}, ${timesText}`;
    newScoreDisplay.innerText = scoreText;
    highScoresDisplay.append(newScoreDisplay);
  }
}
