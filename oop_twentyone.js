let readline = require('readline-sync');

class Card {
  constructor(type) {
    this.type = type;
  }

  value() {
    if (this.type[0] !== 'A') {
      return Number(this.type[0]) || 10;
    } else {
      return 11;
    }
  }
}

class Deck {
  static cardValues = [
    '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'
  ];

  static cardSuits = [
    'Spades', 'Clubs', 'Diamonds', 'Hearts'
  ];

  constructor() {
    this.cards = [];
    this.initCards();
  }

  initCards() {
    Deck.cardValues.forEach((val) => {
      Deck.cardSuits.forEach((suit) => {
        this.cards.push(new Card([val, suit]));
      });
    });
  }

  dealCard() {
    let randIdx = Math.floor(Math.random() * this.cards.length);
    return this.cards.splice(randIdx, 1)[0];
  }
}

class Participant {
  constructor() {
    this.hand = null;
    this.handValue = 0;
  }

  resetHand() {
    this.hand = [];
  }

  addCardToHand(card) {
    this.hand.push(card);
  }

  handString() {
    return this.hand.map((card) => card.type.join(' of ')).join(', ');
  }
}

class Player extends Participant {
  static startingMoney = 5;
  static moneyHighLimit = 10;
  static moneyLowLimit = 0;

  constructor() {
    super();
    this.moneyLeft = Player.startingMoney;
  }

  deductMoney() {
    this.moneyLeft -= 1;
  }

  addMoney() {
    this.moneyLeft += 1;
  }

  moneyOutOfRange() {
    return (this.moneyLeft <= Player.moneyLowLimit
            || this.moneyLeft >= Player.moneyHighLimit);
  }

  showMoneyLeft() {
    let dollarWord = 'dollars';

    if (this.moneyLeft === 1) {
      dollarWord = 'dollar';
    }

    console.log(`You have ${this.moneyLeft} ${dollarWord} left.`);

  }

  showHand() {
    console.log(`Player cards: ${this.handString()}`);
  }
}

class Dealer extends Participant {
  constructor() {
    super();
  }

  showHand() {
    console.log(`Dealer cards: ${this.handString()}`);
  }

  showOneCard() {
    console.log(`Dealer card: ${this.hand[0].type.join(' of ')}`);
  }
}

class CardGame {
  static validYorN(input) {
    return !!input.match(/^[yn]$/i);
  }

  static playAgain() {
    console.log();
    console.log('Play again?  Enter Y to play again, N to quit.');
    let choice = readline.question();
    while (!CardGame.validYorN(choice)) {
      console.log('Invalid input!  Enter Y to play again, N to quit.');
      choice = readline.question();
    }
    return choice.toLowerCase() === 'y';
  }

  constructor(cardNumber) {
    this.startingCardNumber = cardNumber;
    this.deck = null;
    this.player = new Player();
    this.dealer = new Dealer();
    this.winner = null;
  }

  resetCards() {
    this.deck = new Deck();
    this.player.resetHand();
    this.dealer.resetHand();

    for (let idx = 0; idx < this.startingCardNumber; idx += 1) {
      this.player.addCardToHand(this.deck.dealCard());
      this.dealer.addCardToHand(this.deck.dealCard());
    }
  }

  showGameResult() {
    console.log();
    console.log('--> Final hands <--');
    this.player.showHand();
    this.dealer.showHand();
    console.log();
    console.log(this.player.handValue);
    console.log(this.dealer.handValue);
    console.log();
    console.log(`Winner: ${this.winner}`);
  }

  playGame() {
    this.showWelcome();

    do {
      this.resetCards();
      this.playOneGame();
      this.showGameResult();

      if (this.winner === 'player') {
        this.player.addMoney();
      } else if (this.winner === 'dealer') {
        this.player.deductMoney();
      }

      console.log();
      this.player.showMoneyLeft();

    } while (!this.player.moneyOutOfRange() && CardGame.playAgain());

    this.showGoodbye();
  }
}

class TwentyOneGame extends CardGame {
  static validHitOrStayChoice(choice) {
    return !!choice.match(/^[hs]$/i);
  }

  static chooseHitOrStay() {
    console.log('[H]it or [S]tay?  H to hit, S to stay,');
    let choice = readline.prompt();
    while (!TwentyOneGame.validHitOrStayChoice(choice)) {
      console.log('Invalid entry!  Enter H to hit, S to stay');
      choice = readline.prompt();
    }
    return choice.toLowerCase();
  }

  static isBusted(player) {
    return player.handValue > 21;
  }

  constructor(cardNumber) {
    super(cardNumber);
    this.playerBusted = false;
    this.dealerBusted = false;
  }

  playOneGame() {
    this.winner = null;

    this.playerTurn();
    if (this.winner) return;

    this.dealerTurn();
    if (this.winner) return;

    this.updateWinnerFromHandValues();
  }

  playerTurn() {
    let playerChoice;

    do {
      this.showPlayerTurnInfo();
      this.updateHandValue.call(this.player);

      playerChoice = TwentyOneGame.chooseHitOrStay();

      if (playerChoice === 'h') {
        this.player.addCardToHand(this.deck.dealCard());
        this.updateHandValue.call(this.player);
      }

    } while (!(playerChoice === 's' || TwentyOneGame.isBusted(this.player)));

    if (TwentyOneGame.isBusted(this.player)) {
      console.log();
      console.log('You busted!');
      this.winner = 'dealer';
    }
  }

  dealerTurn() {
    this.updateHandValue.call(this.dealer);
    while (this.dealer.handValue < 17) {
      this.dealer.addCardToHand(this.deck.dealCard());
      this.updateHandValue.call(this.dealer);
    }

    if (TwentyOneGame.isBusted(this.dealer)) {
      console.log();
      console.log('Dealer busted!');
      this.winner = 'player';
    }
  }

  updateHandValue() {
    function getCardValue(card) {
      if (card.type[0] !== 'A') {
        return Number(card.type[0]) || 10;
      } else {
        return 11;
      }
    }

    let values = this.hand.map(getCardValue);

    let handTotal = values.reduce((sum, next) => sum + next);

    while (handTotal > 21 && values.includes(11)) {
      let first11idx = values.indexOf(11);
      values.splice(first11idx, 1, 1);
      handTotal = values.reduce((sum, next) => sum + next);
    }

    this.handValue = handTotal;
  }

  showWelcome() {
    console.clear();
    console.log('--> Welcome to Twenty-One <--');
    console.log('You start with 5 dollars.  You gain a dollar for winning, and lose a dollar for losing.');
    console.log('The game ends when you run out of money, get to 10 dollars, or decide not to keep playing.');
    console.log('>> Press enter to start the game.');
    readline.question();
  }

  showMoneyMessage() {
    if (this.player.moneyLeft <= Player.moneyLowLimit) {
      console.log('You ran out of money!  Game over.');
    } else {
      console.log('You got too much money!  Game over.');
    }
  }

  showGoodbye() {
    console.log();
    if (this.player.moneyOutOfRange()) {
      this.showMoneyMessage();
    } else {
      console.log('Goodbye!');
    }
  }

  showPlayerTurnInfo() {
    console.clear();
    console.log(`Money left: ${this.player.moneyLeft} dollar(s)`);
    console.log();
    this.dealer.showOneCard();
    this.player.showHand();
  }

  updateWinnerFromHandValues() {
    if (this.player.handValue > this.dealer.handValue) {
      this.winner = 'player';
    } else if (this.player.handValue < this.dealer.handValue) {
      this.winner = 'dealer';
    } else {
      this.winner = 'tie';
    }
  }
}

let game = new TwentyOneGame(2);
game.playGame();