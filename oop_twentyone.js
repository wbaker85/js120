let readline = require('readline-sync');

class Card {
  constructor(type) {
    this.type = type; // ['J', 'Clubs']
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
  constructor(deck) {
    this.deck = deck;
    this.hand = [this.deck.dealCard(), this.deck.dealCard()];
    this.busted = false;
    this.handValue = 0;
  }

  hit() {
    this.hand.push(this.deck.dealCard());
  }

  updateBusted() {
    this.busted = this.handValue > 21;
  }

  updateHandValue() {
    let values = this.hand.map((card) => card.value());

    let handTotal = values.reduce((sum, next) => sum + next);

    while (handTotal > 21 && values.includes(11)) {
      let first11idx = values.indexOf(11);
      values.splice(first11idx, 1, 1);
      handTotal = values.reduce((sum, next) => sum + next);
    }

    this.handValue = handTotal;
  }

  handString() {
    return this.hand.map((card) => card.type.join(' of ')).join(', ');
  }
}

class Player extends Participant {
  showHand() {
    console.log(`Player cards: ${this.handString()}`);
  }

  validChoice(choice) {
    return !!choice.match(/^[hs]$/i);
  }

  chooseHitOrStay() {
    console.log('[H]it or [S]tay?  H to hit, S to stay,');
    let choice = readline.prompt();
    while (!this.validChoice(choice)) {
      console.log('Invalid entry!  Enter H to hit, S to stay');
      choice = readline.prompt();
    }
    return choice.toLowerCase();
  }
}

class Dealer extends Participant {
  showHand() {
    console.log(`Dealer cards: ${this.handString()}`);
  }

  showOneCard() {
    console.log(`Dealer card: ${this.hand[0].type.join(' of ')}`);
  }
}

class TwentyOneGame {
  constructor() {
    this.deck = new Deck();
    this.player = new Player(this.deck);
    this.dealer = new Dealer(this.deck);
    this.winner = null;
  }

  playGame() {
    while (true) {
      this.playerTurn();
      if (this.player.busted) break;

      this.dealerTurn();
      if (this.dealer.busted) break;

      this.updateWinnerFromHandValues();
      break;
    }

    this.showResult();
  }

  playerTurn() {
    let playerChoice;

    do {
      console.clear();
      this.dealer.showOneCard();
      this.player.showHand();

      playerChoice = this.player.chooseHitOrStay();

      if (playerChoice === 'h') {
        this.player.hit();
      }

      this.player.updateHandValue();
      this.player.updateBusted();

    } while (!(playerChoice === 's' || this.player.busted));

    if (this.player.busted) {
      console.log();
      console.log('You busted!');
      this.winner = 'dealer';
    }
  }

  dealerTurn() {
    while (this.dealer.handValue < 17) {
      this.dealer.hit();
      this.dealer.updateHandValue();
      this.dealer.updateBusted();
    }

    if (this.dealer.busted) {
      console.log();
      console.log('Dealer busted!');
      this.winner = 'player';
    }
  }

  showResult() {
    console.log();
    console.log('Final hands:');
    console.log();
    this.player.showHand();
    this.dealer.showHand();
    console.log();
    console.log(`Winner: ${this.winner}`);
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

let game = new TwentyOneGame();
game.playGame();