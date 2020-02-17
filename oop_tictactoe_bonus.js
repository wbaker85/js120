/*
Notes:
  For joinOr - pretty much implemented it the same as the given solution.  Can you make it a normal funciton outside of any class?
  For play again - i have it creating a new board every game, instead of there being a board reset option
  For defensive computer move - the method given in the possible solution seems to be doing two things:
    Determining if there is a deensive computer move that needs to be made - if there's not, it returns null
    As well as determining choice to be made
    I split up this logic into a few different methods
    Gave the methods "opponent" as a parameter so that they could be extended in the future if desired






*/

let readline = require("readline-sync");
let clear = require("clear");

class Square {
  static UNUSED_SQUARE = " ";
  static HUMAN_MARKER = "X";
  static COMPUTER_MARKER = "O";

  constructor(marker = Square.UNUSED_SQUARE) {
    this.marker = marker;
  }

  toString() {
    return this.marker;
  }

  setMarker(marker) {
    this.marker = marker;
  }

  isUnused() {
    return this.marker === Square.UNUSED_SQUARE;
  }

  getMarker() {
    return this.marker;
  }
}

class Board {
  constructor() {
    this.squares = {};
    for (let counter = 1; counter <= 9; ++counter) {
      this.squares[String(counter)] = new Square();
    }
  }

  display() {
    console.log("");
    console.log("     |     |");
    console.log(`  ${this.squares["1"]}  |  ${this.squares["2"]}  |  ${this.squares["3"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["4"]}  |  ${this.squares["5"]}  |  ${this.squares["6"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["7"]}  |  ${this.squares["8"]}  |  ${this.squares["9"]}`);
    console.log("     |     |");
    console.log("");
  }

  markSquareAt(key, marker) {
    this.squares[key].setMarker(marker);
  }

  isFull() {
    return this.unusedSquares().length === 0;
  }

  unusedSquares() {
    let keys = Object.keys(this.squares);
    return keys.filter(key => this.squares[key].isUnused());
  }

  countMarkersFor(player, keys) {
    let markers = keys.filter(key => {
      return this.squares[key].getMarker() === player.marker;
    });

    return markers.length;
  }

  displayWithClear() {
    clear();
    console.log("");
    console.log("");
    this.display();
  }
}

class Player {
  constructor(marker) {
    this.marker = marker;
  }

  getMarker() {
    return this.marker;
  }
}

class Human extends Player {
  constructor() {
    super(Square.HUMAN_MARKER);
  }
}

class Computer extends Player {
  constructor() {
    super(Square.COMPUTER_MARKER);
  }
}

class TTTGame {
  static POSSIBLE_WINNING_ROWS = [
    [ "1", "2", "3" ],            // top row of board
    [ "4", "5", "6" ],            // center row of board
    [ "7", "8", "9" ],            // bottom row of board
    [ "1", "4", "7" ],            // left column of board
    [ "2", "5", "8" ],            // middle column of board
    [ "3", "6", "9" ],            // right column of board
    [ "1", "5", "9" ],            // diagonal: top-left to bottom-right
    [ "3", "5", "7" ],            // diagonal: bottom-left to top-right
  ];

  static joinOr(listArr, internalSep = ', ', finalSep = 'or') {
    let outputString;

    if (listArr.length === 2) return `${listArr[0]} ${finalSep} ${listArr[1]}`;

    listArr.forEach((elem, idx) => {
      if (idx === 0) {
        outputString = elem.toString();
      } else if ((idx + 1) === listArr.length) {
        outputString += `${internalSep}${finalSep} ${elem}`;
      } else {
        outputString += `${internalSep}${elem}`;
      }
    });

    return outputString;
  }

  static validYorN(input) {
    return input.match(/^[yn]$/i);
  }

  constructor() {
    this.board = null;
    this.human = new Human();
    this.computer = new Computer();
  }

  play() {
    this.displayWelcomeMessage();

    do {
      this.board = new Board();
      this.playOneGame();
    } while (this.playAgain());

    this.displayGoodbyeMessage();
  }

  playAgain() {
    console.log('Do you want to play again?  Enter Y or N.');
    let input = readline.prompt();
    while (!TTTGame.validYorN(input)) {
      console.log('Invalid input!  Enter Y to play again, N to quit.');
      input = readline.prompt();
    }
    return input.toLowerCase() === 'y';
  }

  playOneGame() {
    this.board.display();
    while (true) {
      this.humanMoves();
      if (this.gameOver()) break;

      this.computerMoves();
      if (this.gameOver()) break;

      this.board.displayWithClear();
    }

    this.board.displayWithClear();
    this.displayResults();
  }

  displayWelcomeMessage() {
    clear();
    console.log("Welcome to Tic Tac Toe!");
    console.log("");
  }

  displayGoodbyeMessage() {
    console.log("Thanks for playing Tic Tac Toe! Goodbye!");
  }

  displayResults() {
    if (this.isWinner(this.human)) {
      console.log("You won! Congratulations!");
    } else if (this.isWinner(this.computer)) {
      console.log("I won! I won! Take that, human!");
    } else {
      console.log("A tie game. How boring.");
    }
  }

  humanMoves() {
    let choice;

    while (true) {
      let validChoices = this.board.unusedSquares();
      const prompt = `Choose a square (${TTTGame.joinOr(validChoices, ', ', 'or')}): `;
      choice = readline.question(prompt);

      if (validChoices.includes(choice)) break;

      console.log("Sorry, that's not a valid choice.");
      console.log("");
    }

    this.board.markSquareAt(choice, this.human.getMarker());
  }

  //
  // beginning of computer AI stuff
  //

  randomUnusedSquare() {
    let validChoices = this.board.unusedSquares();
    let choice;

    do {
      choice = Math.floor((9 * Math.random()) + 1).toString();
    } while (!validChoices.includes(choice));

    return choice;
  }

  winningConditionExists(player) {
    return TTTGame.POSSIBLE_WINNING_ROWS.some((row) => {
      return this.rowHasWinningCondition(row, player);
    });
  }

  rowHasWinningCondition(row, player) {
    return this.board.countMarkersFor(player, row) === 2
           && row.some((key) => this.board.squares[key].isUnused());
  }

  listOfWinningRows(player) {
    return TTTGame.POSSIBLE_WINNING_ROWS.filter((row) => {
      return this.rowHasWinningCondition(row, player);
    });
  }

  randomRowFromList(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  choiceToBlockOrWin(player) {
    let winningRows = this.listOfWinningRows(player);
    let randomWinningRow = this.randomRowFromList(winningRows);

    return randomWinningRow.find((choice) => {
      return this.board.squares[choice].isUnused();
    });
  }

  computerMoves() {
    let choice;

    if (this.winningConditionExists(this.computer)) {
      choice = this.choiceToBlockOrWin(this.computer);
    } else if (this.winningConditionExists(this.human)) {
      choice = this.choiceToBlockOrWin(this.human);
    } else {
      choice = this.randomUnusedSquare();
    }

    this.board.markSquareAt(choice, this.computer.getMarker());
  }

  //
  // End of computer AI stuff
  //

  gameOver() {
    return this.board.isFull() || this.someoneWon();
  }

  someoneWon() {
    return this.isWinner(this.human) || this.isWinner(this.computer);
  }

  isWinner(player) {
    return TTTGame.POSSIBLE_WINNING_ROWS.some(row => {
      return this.board.countMarkersFor(player, row) === 3;
    });
  }
}

let game = new TTTGame();
game.play();