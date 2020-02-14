let readline = require('readline-Sync');
let clear = require('clear');

class Spot {
  constructor(emptyMark) {
    this.value = emptyMark;
  }

  mark(aMark) {
    this.value = aMark;
  }

  getValue() {
    return this.value;
  }
}

class Board {
  constructor(emptyMark) {
    this.emptyMark = emptyMark;
    this.spots = {};
    this.initBoard();
    this.winner = null;
  }

  static EMPTY_MARK = '-';

  initBoard() {
    for (let idx = 1; idx <= 9; idx += 1) {
      this.spots[idx] = new Spot(this.emptyMark);
    }
  }

  isFull() {
    return Object.values(this.spots).every((spotObj) => {
      return spotObj.value !== this.emptyMark;
    });
  }

  showBoard() {
    console.log(`${this.spots[1].value} | ${this.spots[2].value} | ${this.spots[3].value}`);
    console.log(`${this.spots[4].value} | ${this.spots[5].value} | ${this.spots[6].value}`);
    console.log(`${this.spots[7].value} | ${this.spots[8].value} | ${this.spots[9].value}`);
  }

  getChoices() {
    return Object.entries(this.spots)
            .filter((spot) => spot[1].value === this.emptyMark)
            .map((spot) => spot[0]);
  }

  showChoices() {
    console.log(this.getChoices().join(', '));
  }

}

class Player {
  constructor(mark) {
    this.myMark = mark;
    this.myBoard = null;
  }

  doMyTurn(board) {
    this.myBoard = board;
    if (this instanceof HumanPlayer) {
      clear();
      this.myBoard.showBoard();
    }
    let spotIdx = this.pickSpot();
    this.myBoard.spots[spotIdx].mark(this.myMark);
  }
}

class HumanPlayer extends Player {
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
  pickSpot() {
    let choices = this.myBoard.getChoices();
    return choices[Math.floor(Math.random() * choices.length)];
  }
}

class Game {
  constructor() {
    this.marks = Game.MARKER_OPTIONS;
    this.players = [
      new HumanPlayer(this.humanMarkChoice()),
      new ComputerPlayer(this.computerMarkChoice())
    ];
    this.humanMark = this.players[0].myMark;
    this.board = new Board(Game.EMPTY_MARK);
    this.outcome = null;
  }

  static MARKER_OPTIONS = ['X', 'O'];

  static EMPTY_MARK = '-';

  static WINNING_INDICES = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [7, 5, 3],
  ];

  updateRows() {
    this.rows = Game.WINNING_INDICES.map((row) => {
      return row.map((spotNumber) => {
        return this.board.spots[spotNumber].value;
      });
    });
  }

  humanMarkChoice() {
    console.log('Choose a marker [enter 0 or 1]');
    let choice = readline.prompt();
    return this.marks.splice(Number(choice), 1)[0];
  }

  computerMarkChoice() {
    let choice = Math.floor(Math.random() * this.marks.length);
    return this.marks.splice(Number(choice), 1)[0];
  }

  playTurn() {
    this.players[0].doMyTurn(this.board);
    this.updateOutcome();
    [this.players[0], this.players[1]] = [this.players[1], this.players[0]];
  }

  updateOutcome() {
    if (this.gameHasWinner()) {
      this.outcome = this.gameWinner();
    } else if (this.board.isFull()) {
      this.outcome = 'tie';
    }
  }

  showOutcome() {
    clear();
    this.board.showBoard();
    if (this.outcome === this.humanMark) {
      console.log('Human won!');
    } else if (this.outcome === 'tie') {
      console.log('It was a tie!');
    } else {
      console.log('Computer won!');
    }
  }

  gameHasWinner() {
    return Game.WINNING_INDICES.some((spotList) => {
      let theseMarks = spotList.map((num) => this.board.spots[num].getValue());
      let vals = new Set(theseMarks);
      let hasEmpties = vals.has(Game.EMPTY_MARK);
      return vals.size === 1 && !hasEmpties;
    });
  }

  gameWinner() {
    return Game.WINNING_INDICES
            .map((rowNums) => rowNums.map((num) =>
              this.board.spots[num].getValue())
            )
            .filter((rowVals) => !rowVals.includes(Game.EMPTY_MARK))
            .filter((rowVals) => (new Set(rowVals)).size === 1)[0][0];
  }

}

class TTTEngine {
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

(new TTTEngine()).play();