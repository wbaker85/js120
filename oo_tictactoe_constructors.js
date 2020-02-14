let readline = require('readline-Sync');
let clear = require('clear');

function Spot(mark) {
  this.value = mark;
}

Spot.prototype = {
  constructor: Spot,

  mark(aMark) {
    this.value = aMark;
  },

  getValue() {
    return this.value;
  },
};

function Board(initialMark) {
  function initBoard() {
    for (let idx = 1; idx <= 9; idx += 1) {
      this.spots[idx] = new Spot(this.emptyMark);
    }
  }

  this.emptyMark = initialMark;
  this.spots = {};
  this.winner = null;
  initBoard.call(this);
}

Board.prototype = {
  constructor: Board,

  isFull() {
    return Object.values(this.spots).every((spotObj) => {
      return spotObj.value !== this.emptyMark;
    });
  },

  showBoard() {
    console.log(`${this.spots[1].value} | ${this.spots[2].value} | ${this.spots[3].value}`);
    console.log(`${this.spots[4].value} | ${this.spots[5].value} | ${this.spots[6].value}`);
    console.log(`${this.spots[7].value} | ${this.spots[8].value} | ${this.spots[9].value}`);
  },

  getChoices() {
    return Object.entries(this.spots)
            .filter((spot) => spot[1].value === this.emptyMark)
            .map((spot) => spot[0]);
  },

  showChoices() {
    console.log(this.getChoices().join(', '));
  },
};

function Player() {
}

Player.prototype = {
  constructor: Player,

  doMyTurn(board) {
    if (this instanceof HumanPlayer) {
      clear();
      board.showBoard();
    }
    let spotIdx = this.pickSpot(board);
    board.spots[spotIdx].mark(this.myMark);
  }
};

function HumanPlayer(mark) {
  this.myMark = mark;
}

HumanPlayer.prototype = {
  constructor: HumanPlayer,

  pickSpot(board) {
    let choice;

    do {
      console.log('Pick a spot:');
      board.showChoices();
      choice = readline.prompt();
    } while (!(board.getChoices().includes(choice)));

    return choice;
  }
};

Object.setPrototypeOf(HumanPlayer.prototype, Player.prototype);

function ComputerPlayer(mark) {
  this.myMark = mark;
}

ComputerPlayer.prototype = {
  constructor: ComputerPlayer,

  pickSpot(board) {
    let choices = board.getChoices();
    return choices[Math.floor(Math.random() * choices.length)];
  }
};

Object.setPrototypeOf(ComputerPlayer.prototype, Player.prototype);

function Game() {
  this.marks = Game.MARKER_OPTIONS;
  this.players = [
    new HumanPlayer(this.humanMarkChoice()),
    new ComputerPlayer(this.computerMarkChoice())
  ];
  this.humanMark = this.players[0].myMark;
  this.board = new Board(Game.EMPTY_MARK);
  this.outcome = null;
}

Game.MARKER_OPTIONS = ['X', 'O'];
Game.EMPTY_MARK = '-';
Game.WINNING_INDICES = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
  [1, 5, 9],
  [7, 5, 3],
];

Game.prototype = {
  constructor: Game,

  updateRows() {
    this.rows = Game.WINNING_INDICES.map((row) => {
      return row.map((spotNumber) => {
        return this.board.spots[spotNumber].value;
      });
    });
  },

  humanMarkChoice() {
    console.log('Choose a marker [enter 0 or 1]');
    let choice = readline.prompt();
    return this.marks.splice(Number(choice), 1)[0];
  },

  computerMarkChoice() {
    let choice = Math.floor(Math.random() * this.marks.length);
    return this.marks.splice(Number(choice), 1)[0];
  },

  playTurn() {
    this.players[0].doMyTurn(this.board);
    this.updateOutcome();
    [this.players[0], this.players[1]] = [this.players[1], this.players[0]];
  },

  updateOutcome() {
    if (this.gameHasWinner()) {
      this.outcome = this.gameWinner();
    } else if (this.board.isFull()) {
      this.outcome = 'tie';
    }
  },

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
  },

  gameHasWinner() {
    return Game.WINNING_INDICES.some((spotList) => {
      let theseMarks = spotList.map((num) => this.board.spots[num].getValue());
      let vals = new Set(theseMarks);
      let hasEmpties = vals.has(Game.EMPTY_MARK);
      return vals.size === 1 && !hasEmpties;
    });
  },

  gameWinner() {
    return Game.WINNING_INDICES
            .map((rowNums) => rowNums.map((num) =>
              this.board.spots[num].getValue())
            )
            .filter((rowVals) => !rowVals.includes(Game.EMPTY_MARK))
            .filter((rowVals) => (new Set(rowVals)).size === 1)[0][0];
  },
};

function TTTEngine() {
  this.game = new Game();
}

TTTEngine.prototype = {
  constructor: TTTEngine,

  play() {
    while (!this.game.outcome) {
      this.game.playTurn();
    }

    this.game.showOutcome();
  },
};

let myEng = new TTTEngine();
myEng.play();