const readline = require('readline-sync');

const POSSIBLE_MOVES = ['rock', 'paper', 'scissors', 'spock', 'lizard'];

const WIN_CONDITIONS = {
  paper: ['rock', 'spock'],
  rock: ['scissors', 'lizard'],
  scissors: ['paper', 'lizard'],
  spock: ['scissors', 'rock'],
  lizard: ['paper', 'spock'],
};

const ROUND_LIMIT = 5;

// This factor will adjust how strongly the computer favors moves which
// have won in previous matches.
const COMPUTER_UPPER_FACTOR = 5;

let clearScreen = () => console.clear();

let validYorN = function(input) {
  return input.match(/[yn]/i);
};

let yesOrNoChoice = function(message) {
  console.log(message);
  let input = readline.prompt();
  while (!validYorN(input)) {
    console.log("Invalid input, please enter Y or N!");
    input = readline.prompt();
  }
  return input.toLowerCase() === 'y';
};

let joinOr = function(array) {
  let output = '';

  array.forEach((item, idx) => {
    if (output === '') {
      output += item;
    } else if (idx === array.length - 1) {
      output += `, or ${item}`;
    } else {
      output += `, ${item}`;
    }
  });

  return output;
};

let prompt = function(string) {
  console.log(`=> ${string}`);
};

function createPlayer(playerType) {
  let playerObject = { move: null };
  let specificObject = playerType === 'human'
    ? createHuman()
    : createComputer();

  return Object.assign(playerObject, specificObject);
}

function createHuman() {
  return {
    validInput(choice) {
      return POSSIBLE_MOVES.includes(choice);
    },

    choose() {
      prompt(`Choose one: ${joinOr(POSSIBLE_MOVES)}.`);
      let input = readline.prompt().toLowerCase();
      while (!this.validInput(input)) {
        prompt('Invalid input, try again!');
        input = readline.prompt().toLowerCase();
      }
      this.move = input;
    },
  };
}

// eslint-disable-next-line max-lines-per-function
function createComputer() {
  return {
    computerChoices: POSSIBLE_MOVES,
    winsPerMove: {},
    adjustmentFactors: {},

    netWinsForOneMove(roundHistory, move) {
      let netWins = 0;

      roundHistory.history
        .filter((round) => round.computer === move && round.winner !== 'tie')
        .forEach((round) => {
          netWins += round.winner === 'computer' ? 1 : -1;
        });

      return (netWins < 0) ? 0 : netWins;
    },

    updateWinsPerMove(roundHistory) {
      POSSIBLE_MOVES.forEach((move) => {
        this.winsPerMove[move] = this.netWinsForOneMove(roundHistory, move);
      });
    },

    netTotalWins() {
      return Object.values(this.winsPerMove).reduce((sum, num) =>
        sum + num
      );
    },

    updateAdjustmentFactors() {
      Object.keys(this.winsPerMove).forEach((move) => {
        let percentage = (this.winsPerMove[move] / this.netTotalWins()) || 0;
        let factor = (percentage * (COMPUTER_UPPER_FACTOR - 1)) + 1;
        this.adjustmentFactors[move] = Math.round(factor);
      });
    },

    adjustComputerChoices() {
      let newChoices = [];

      Object.keys(this.adjustmentFactors).forEach((choice) => {
        for (let idx = 0; idx < this.adjustmentFactors[choice]; idx += 1) {
          newChoices.push(choice);
        }
      });

      this.computerChoices = newChoices;
    },

    choose(roundHistory) {
      this.updateWinsPerMove(roundHistory);
      this.updateAdjustmentFactors();
      this.adjustComputerChoices();

      let randIndex = Math.floor(Math.random() * this.computerChoices.length);
      this.move = this.computerChoices[randIndex];
    },
  };
}

// eslint-disable-next-line max-lines-per-function
function createRound(human, computer) {
  return {
    roundWinner: null,

    determineRoundWinner() {
      let humanMove = human.move;
      let computerMove = computer.move;
      if (WIN_CONDITIONS[humanMove].includes(computerMove)) {
        this.roundWinner = 'human';
      } else if (humanMove === computerMove) {
        this.roundWinner = 'tie';
      } else {
        this.roundWinner = 'computer';
      }
    },

    displayRoundResults() {
      console.log();
      prompt(`You chose ${human.move}`);
      prompt(`Computer chose ${computer.move}`);
      console.log();

      switch (this.roundWinner) {
        case 'human':
          prompt('You won this round!');
          break;
        case 'computer':
          prompt('Computer won this round!');
          break;
        default:
          prompt('This round was was a tie!');
      }
      console.log();
    },

    playRound(roundHistory) {
      human.choose();
      computer.choose(roundHistory);
      this.determineRoundWinner();
      this.displayRoundResults();
    },
  };
}

function createScore() {
  return {
    currentScore: {human: 0, computer: 0},

    updateScore(winner) {
      if (winner !== 'tie') {
        this.currentScore[winner] += 1;
      }
    },

    displayScore() {
      prompt(`Current score is Human: ${this.currentScore.human}, Computer: ${this.currentScore.computer}`);
    },
  };
}

// eslint-disable-next-line max-lines-per-function
function createHistory() {
  return {
    history: [],

    displayHistory() {
      console.log();
      this.history.forEach((round, idx) => {
        let endStr = '';
        if (round.winner === 'tie') {
          endStr = 'it was a tie';
        } else {
          endStr = `${round.winner} won`;
        }
        prompt(`Round ${idx + 1}: Human chose ${round.human}, computer chose ${round.computer}, ${endStr}.`);
      });
      console.log();
    },

    updateGameHistory(humanMove, computerMove, winner) {
      let thisRound = {
        human: humanMove,
        computer: computerMove,
        winner: winner,
      };
      this.history.push(thisRound);
    },

    userWantsHistory() {
      let prompt = "Would you like to see the results of all the rounds?  Y for yes, N for no.";
      return yesOrNoChoice(prompt);
    },
  };
}

const RPSGame = {
  human: createPlayer('human'),
  computer: createPlayer('computer'),
  score: null,
  round: null,
  winner: null,
  gameHistory: createHistory(),

  displayWelcomeMessage() {
    prompt('Welcome to Rock, Paper, Scissors!');
    console.log();
  },

  displayGoodbyeMessage() {
    prompt('Thanks for playing Rock, Paper, Scissors. Goodbye!');
  },

  playAgain() {
    let prompt = "Do you want to play again?  Y for yes, N for no.";
    return yesOrNoChoice(prompt);
  },

  gameOver() {
    return Object.values(this.score.currentScore).some((val) =>
      val >= ROUND_LIMIT
    );
  },

  determineWinner() {
    if (this.score.currentScore.human === ROUND_LIMIT) {
      this.winner = 'human';
    } else {
      this.winner = 'computer';
    }
  },

  displayGameResults() {
    prompt(`The final score was Human: ${this.score.currentScore.human}, Computer: ${this.score.currentScore.computer}`);
    if (this.winner === 'human') {
      prompt('You won the game!');
    } else {
      prompt('Computer won the game!');
    }
    console.log();
  },

  promptForNextRound() {
    console.log();
    prompt('Hit enter to start the next round!');
    readline.question();
    clearScreen();
  },

  playAllRounds() {
    while (true) {
      this.round = createRound(this.human, this.computer);
      this.round.playRound(this.gameHistory);
      this.score.updateScore(this.round.roundWinner);

      this.gameHistory.updateGameHistory(
          this.human.move,
          this.computer.move,
          this.round.roundWinner,
        );

      if (this.gameOver()) return;
      this.score.displayScore();
      this.promptForNextRound();
    }
  },

  playOneGame() {
    this.score = createScore();
    this.playAllRounds();
    this.determineWinner();
    this.displayGameResults();
  },

  play() {
    do {
      clearScreen();
      this.displayWelcomeMessage();
      this.playOneGame();
    } while (this.playAgain());

    if (this.gameHistory.userWantsHistory()) this.gameHistory.displayHistory();
    this.displayGoodbyeMessage();
  },
};

RPSGame.play();