let readline = require('readline-sync');

class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }
}

class Deck {
  static cardRanks = [
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
    Deck.cardRanks.forEach((rank) => {
      Deck.cardSuits.forEach((suit) => {
        this.cards.push(new Card(rank, suit));
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
  }

  resetHand() {
    this.hand = [];
  }

  addCardToHand(card) {
    this.hand.push(card);
  }

  handString() {
    return this.hand.map((card) => `${card.rank} of ${card.suit}`).join(', ');
  }
}

class Player extends Participant {
  constructor() {
    super();
  }
}

class Dealer extends Participant {
  constructor() {
    super();
    this.cardsHidden = false;
  }

  toggleCardsHidden() {
    this.cardsHidden = !this.cardsHidden;
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
    let participants = [this.player, this.dealer];

    participants.forEach((part) => part.resetHand());

    for (let idx = 0; idx < this.startingCardNumber; idx += 1) {
      participants.forEach((part) => part.addCardToHand(this.deck.dealCard()));
    }
  }

  playGame() {
    this.showWelcome();

    do {
      this.resetCards();
      this.playOneGame();
      this.showGameResult();

    } while (!this.gamesOver() && CardGame.playAgain());

    this.showGoodbye();
  }

  gamesOver() {
    return this.moneyOutOfRange();
  }
}

class TwentyOne extends CardGame {
  static STARTING_MONEY = 5;
  static MONEY_HIGH_LIMIT = 10;
  static MONEY_LOW_LIMIT = 0;

  static getCardValue(card) {
    if (card.rank !== 'A') {
      return Number(card.rank) || 10;
    } else {
      return 11;
    }
  }

  constructor() {
    super(2);
    this.playerBusted = false;
    this.dealerBusted = false;
    this.player.handValue = 0;
    this.dealer.handValue = 0;
    this.playerMoneyLeft = TwentyOne.STARTING_MONEY;
  }

  playOneGame() {
    this.winner = null;

    while (!this.winner) {
      this.dealer.toggleCardsHidden();
      this.playTurn(this.player);
      this.dealer.toggleCardsHidden();

      if (this.isBusted(this.player)) {
        this.winner = this.dealer;
        break;
      }

      this.playTurn(this.dealer);
      if (this.isBusted(this.dealer)) {
        this.winner = this.player;
        break;
      }

      this.updateWinnerFromHandValues();
    }
    this.updateHandValue(this.dealer);
    this.updatePlayerMoneyFromResult();
  }

  moneyOutOfRange() {
    return (this.playerMoneyLeft <= TwentyOne.MONEY_LOW_LIMIT
            || this.playerMoneyLeft >= TwentyOne.MONEY_HIGH_LIMIT);
  }

  validHitOrStayChoice(choice) {
    return !!choice.match(/^[hs]$/i);
  }

  playerChooseHitOrStay() {
    console.log('[H]it or [S]tay?  H to hit, S to stay,');
    let choice = readline.prompt();
    while (!this.validHitOrStayChoice(choice)) {
      console.log('Invalid entry!  Enter H to hit, S to stay');
      choice = readline.prompt();
    }
    return choice.toLowerCase();
  }

  dealerChooseHitOrStay() {
    return this.dealer.handValue < 17 ? 'h' : 's';
  }

  updateHandValue(participant) {
    let values = participant.hand.map(TwentyOne.getCardValue);

    let handTotal = values.reduce((sum, next) => sum + next);

    while (handTotal > 21 && values.includes(11)) {
      let first11idx = values.indexOf(11);
      values.splice(first11idx, 1, 1);
      handTotal = values.reduce((sum, next) => sum + next);
    }

    participant.handValue = handTotal;
  }

  isBusted(participant) {
    return participant.handValue > 21;
  }

  playTurn(participant) {
    let choice;

    do {
      this.updateHandValue(participant);
      this.showTurnInfo();

      if (participant.hasOwnProperty('cardsHidden')) {
        readline.question('Press enter to continue...');
      }

      if (participant.hasOwnProperty('cardsHidden')) {
        choice = this.dealerChooseHitOrStay();
      } else {
        choice = this.playerChooseHitOrStay();
      }

      if (choice === 'h') {
        participant.addCardToHand(this.deck.dealCard());
        this.updateHandValue(participant);
      }

    } while (!(choice === 's' || this.isBusted(participant)));
  }

  updatePlayerMoneyFromResult() {
    if (this.winner === this.player) {
      this.playerMoneyLeft += 1;
    } else if (this.winner === this.dealer) {
      this.playerMoneyLeft -= 1;
    }
  }

  updateWinnerFromHandValues() {
    if (this.player.handValue > this.dealer.handValue) {
      this.winner = this.player;
    } else if (this.player.handValue < this.dealer.handValue) {
      this.winner = this.dealer;
    } else {
      this.winner = 'tie';
    }
  }

  showWelcome() {
    console.clear();
    console.log('--> Welcome to Twenty-One <--');
    console.log('You start with 5 dollars.  You gain a dollar for winning, and lose a dollar for losing.');
    console.log('The game ends when you run out of money, get to 10 dollars, or decide not to keep playing.');
    console.log('>> Press enter to start the game.');
    readline.question();
  }

  showMoneyResult() {
    if (this.playerMoneyLeft <= TwentyOne.MONEY_LOW_LIMIT) {
      console.log('You ran out of money!  Game over.');
    } else {
      console.log('You got too much money!  Game over.');
    }
  }

  showGoodbye() {
    console.log();
    if (this.moneyOutOfRange()) {
      this.showMoneyResult();
    } else {
      console.log('Goodbye!');
    }
  }

  showHand(participant) {
    let prefix = (participant instanceof Dealer)
                    ? 'Dealer Cards: '
                    : 'Player Cards: ';

    console.log(`${prefix }${participant.handString()} (${participant.handValue} points)`);
  }

  showOneDealerCard() {
    console.log(`Dealer cards: ${this.dealer.hand[0].rank} of ${this.dealer.hand[0].suit}, [hidden].`);
  }

  showTurnInfo() {
    console.clear();
    console.log(`Money left: ${this.playerMoneyLeft} dollar(s)`);
    console.log();
    if (this.dealer.cardsHidden) {
      this.showOneDealerCard();
    } else {
      this.showHand(this.dealer);
    }
    this.showHand(this.player);
  }

  showGameResult() {
    this.showTurnInfo();
    console.log();

    if (this.isBusted(this.player)) {
      console.log('You busted - the dealer won!');
    } else if (this.isBusted(this.dealer)) {
      console.log('The dealer busted - you won!');
    } else {
      switch (this.winner) {
        case this.player:
          console.log('You won!');
          break;
        case this.dealer:
          console.log('The dealer won!');
          break;
        default:
          console.log('It was a tie.');
      }
    }
  }
}

let game = new TwentyOne();
game.playGame();