let readline = require('readline-Sync');
let clear = require('clear');

let Spot = {
  init(mark) {
    this.value = mark;
    return this;
  },

  mark(aMark) {
    this.value = aMark;
  },

  getValue() {
    return this.value;
  },
};

let Board = {
  init(initialMark) {
    function initBoard() {
      for (let idx = 1; idx <= 9; idx += 1) {
        this.spots[idx] = Object.create(Spot).init(initialMark);
      }
    }

    this.emptyMark = initialMark;
    this.spots = {};
    this.winner = null;
    initBoard.call(this);
    return this;
  },

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

let Player = {
  doMyTurn(board) {
    if (Object.getPrototypeOf(this) === HumanPlayer) {
      clear();
      board.showBoard();
    }
    let spotIdx = this.pickSpot(board);
    board.spots[spotIdx].mark(this.myMark);
  },
};

let HumanPlayer = {
  init(mark) {
    this.myMark = mark;
    return this;
  },

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

Object.setPrototypeOf(HumanPlayer, Player);

let ComputerPlayer = {
  init(mark) {
    this.myMark = mark;
    return this;
  },

  pickSpot(board) {
    let choices = board.getChoices();
    return choices[Math.floor(Math.random() * choices.length)];
  }
};

Object.setPrototypeOf(ComputerPlayer, Player);

let Game = {
  MARKER_OPTIONS: ['X', 'O'],

  EMPTY_MARK: '-',

  WINNING_INDICES: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [7, 5, 3],
  ],

  init() {
    this.marks = Game.MARKER_OPTIONS;
    this.players = [
      Object.create(HumanPlayer).init(this.humanMarkChoice()),
      Object.create(ComputerPlayer).init(this.computerMarkChoice())
    ];
    this.humanMark = this.players[0].myMark;
    this.board = Object.create(Board.init(Game.EMPTY_MARK));
    this.outcome = null;
    return this;
  },

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
  }
};

let TTTEngine = {
  init() {
    this.game = Object.create(Game).init();
    return this;
  },

  play() {
    while (!this.game.outcome) {
      this.game.playTurn();
    }

    this.game.showOutcome();
  },
};

let myEng = Object.create(TTTEngine).init();
myEng.play();