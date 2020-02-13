/*
TTT is a game played by two players.
One player is a human, one player is a computer.
Each player takes alternating turns.
On a given player's turn, they choose a spot on the board to mark with their mark (an X or an O).
The board is a 3x3 grid of possible options to place a mark.  Only 1 mark can go in a spot.
Once a player finishes a row with all of their mark, they win.
A row consists of 3 across, 3 down, or 3 diagonal.
If the board fills up without a winner, the game ends in a tie.


Main:
  Make a game
  Run a turn of that game
  If the game is over, show the result
  Otherwise run another turn

Game (n)
  Has:
    A board
    2 Players
    Outcome

  Run a turn (v)
  Check for an outcome (v)
  Show the outcome (v)

Player (n)
  Has:
    selectedMark
    turnOrder
    selectedSpot

  Do my turn (v) => doMyTurn()
  Chose a spot (v)
  Chose mark (v)
  Chose turn order (v)

  Sub-Types:
    Human (n)
    Computer (n)

Board (n)
  Has:
    horizontal rows
    veritical rows
    diagonal rows

  See if there is a winner (v) => gameIsOver();
  Evaluate Winner (v) => getWinner();
  Show the Board (v)
  Show choices (v)

Row (n)
  Has: Spots

  Check for a winner (v)
  Get the winner (v)

Spot (n)
  Has:
    current value
    index position (1 through 9)

  Mark a Spot (v)
  Show current value (v)

*/
let readline = require('readline-Sync');

const EMPTY_MARK = '-';
const HUMAN_MARK = 'X';
const COMPUTER_MARK = 'O';
const WINNING_INDICES = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
  [1, 5, 9],
  [7, 5, 3],
];

class Board {
  constructor() {
    this.spots = {};
    this.initBoard();
    this.rows = [];
  }

  initBoard() {
    for (let idx = 1; idx <= 9; idx += 1) {
      this.spots[idx] = EMPTY_MARK;
    }
  }

  updateRows() {
    this.rows = WINNING_INDICES.map((row) => {
      return row.map((spotNumber) => {
        return this.spots[spotNumber];
      });
    });
  }

  getWinner() {
    this.updateRows();

    let winner = null;

    if (Object.values(this.spots).every((mark) => mark !== EMPTY_MARK)) {
      winner = 'tie';
    }

    this.rows.forEach((row) => {
      if ((new Set(row)).size === 1 && !(row.includes(EMPTY_MARK))) {
        winner = row[0] === HUMAN_MARK ? 'human' : 'computer';
      }
    });

    return winner;
  }

  showBoard() {
    console.log(`${this.spots[1]} | ${this.spots[2]} | ${this.spots[3]}`);
    console.log(`${this.spots[4]} | ${this.spots[5]} | ${this.spots[6]}`);
    console.log(`${this.spots[7]} | ${this.spots[8]} | ${this.spots[9]}`);
  }

  showChoices() {
    console.log(this.getChoices().join(', '));
  }

  getChoices() {
    return Object.entries(this.spots)
            .filter((spot) => spot[1] === EMPTY_MARK)
            .map((spot) => spot[0]);
  }
}

class Player {
  markBoard(spotIdx) {
    this.myBoard.spots[spotIdx] = this.myMark;
  }
}

class HumanPlayer extends Player {
  constructor() {
    super();
    this.myBoard = null;
    this.myMark = HUMAN_MARK;
  }

  doMyTurn(board) {
    this.myBoard = board;
    this.myBoard.showBoard();
    let spotIdx = this.pickSpot();
    this.markBoard(spotIdx);
  }

  pickSpot() {
    let choice;

    do {
      console.log('Pick a spot:');
      this.myBoard.showChoices();
      choice = readline.prompt();
    } while (!(this.myBoard.getChoices().includes(choice)));

    return choice;
  }
}

class ComputerPlayer extends Player {
  constructor() {
    super();
    this.myBoard = null;
    this.myMark = COMPUTER_MARK;
  }

  doMyTurn(board) {
    this.myBoard = board;
    let spotIdx = this.pickSpot();
    this.markBoard(spotIdx);
  }

  pickSpot() {
    let choices = this.myBoard.getChoices();
    return choices[Math.floor(Math.random() * choices.length)];
  }
}

class Game {
  constructor() {
    this.board = new Board();
    this.players = [new HumanPlayer(), new ComputerPlayer()];
    this.outcome = null;
  }

  playTurn() {
    this.players[0].doMyTurn(this.board);
    this.updateOutcome();
    [this.players[0], this.players[1]] = [this.players[1], this.players[0]];
  }

  updateOutcome() {
    this.outcome = this.board.getWinner();
  }

  showOutcome() {
    console.log(this.outcome);
    this.board.showBoard();
  }
}

class Main {
  constructor() {
    this.game = new Game();
  }

  play() {
    while (!this.game.outcome) {
      this.game.playTurn();
    }

    this.game.showOutcome();
  }
}

(new Main()).play();