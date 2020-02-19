let readline = require('readline-sync');

class Card {
  constructor(type) {
    this.type = type;
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
    Deck.cardRanks.forEach((val) => {
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

  deductMoney() {
    this.moneyLeft -= 1;
  }

  addMoney() {
    this.moneyLeft += 1;
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

    } while (!this.player.moneyOutOfRange() && CardGame.playAgain());

    this.showGoodbye();
  }
}

class TwentyOne extends CardGame {
  static STARTING_MONEY = 5;
  static MONEY_HIGH_LIMIT = 10;
  static MONEY_LOW_LIMIT = 0;

  static commonCapabilitiesMixin = [
    {
      updateHandValue() {
        let values = this.hand.map(TwentyOne.getCardValue);

        let handTotal = values.reduce((sum, next) => sum + next);

        while (handTotal > 21 && values.includes(11)) {
          let first11idx = values.indexOf(11);
          values.splice(first11idx, 1, 1);
          handTotal = values.reduce((sum, next) => sum + next);
        }

        this.handValue = handTotal;
      }
    },
    {
      isBusted() {
        return this.handValue > 21;
      }
    },
  ]

  static playerCapabilitiesMixin = {
    moneyLeft: TwentyOne.STARTING_MONEY,

    moneyOutOfRange() {
      return (this.moneyLeft <= TwentyOne.MONEY_LOW_LIMIT
              || this.moneyLeft >= TwentyOne.MONEY_HIGH_LIMIT);
    },

    validHitOrStayChoice(choice) {
      return !!choice.match(/^[hs]$/i);
    },

    chooseHitOrStay() {
      console.log('[H]it or [S]tay?  H to hit, S to stay,');
      let choice = readline.prompt();
      while (!this.validHitOrStayChoice(choice)) {
        console.log('Invalid entry!  Enter H to hit, S to stay');
        choice = readline.prompt();
      }
      return choice.toLowerCase();
    },
  }

  static dealerCapbilitiesMixin = {
    chooseHitOrStay() {
      return this.handValue < 17 ? 'h' : 's';
    }
  }

  static getCardValue(card) {
    if (card.type[0] !== 'A') {
      return Number(card.type[0]) || 10;
    } else {
      return 11;
    }
  }

  constructor() {
    super(2);
    this.playerBusted = false;
    this.dealerBusted = false;

    Object.values(TwentyOne.commonCapabilitiesMixin).forEach((obj) => {
      [this.player, this.dealer].forEach((part) => Object.assign(part, obj));
    });

    Object.assign(this.player, TwentyOne.playerCapabilitiesMixin);
    Object.assign(this.dealer, TwentyOne.dealerCapbilitiesMixin);
  }

  playOneGame() {
    this.winner = null;

    while (!this.winner) {
      this.dealer.toggleCardsHidden();
      this.playTurn(this.player);
      this.dealer.toggleCardsHidden();

      if (this.player.isBusted()) {
        this.winner = 'dealer';
        break;
      }

      this.playTurn(this.dealer);
      if (this.dealer.isBusted()) {
        this.winner = 'player';
        break;
      }

      this.updateWinnerFromHandValues();
    }
    this.dealer.updateHandValue();
    this.updatePlayerMoneyFromResult();
  }

  playTurn(participant) {
    let choice;

    do {
      participant.updateHandValue();
      this.showTurnInfo();

      choice = participant.chooseHitOrStay();

      if (choice === 'h') {
        participant.addCardToHand(this.deck.dealCard());
        participant.updateHandValue();
      }

    } while (!(choice === 's' || participant.isBusted()));
  }

  updatePlayerMoneyFromResult() {
    if (this.winner === 'player') {
      this.player.addMoney();
    } else if (this.winner === 'dealer') {
      this.player.deductMoney();
    }
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

  showWelcome() {
    console.clear();
    console.log('--> Welcome to Twenty-One <--');
    console.log('You start with 5 dollars.  You gain a dollar for winning, and lose a dollar for losing.');
    console.log('The game ends when you run out of money, get to 10 dollars, or decide not to keep playing.');
    console.log('>> Press enter to start the game.');
    readline.question();
  }

  showMoneyResult() {
    if (this.player.moneyLeft <= TwentyOne.MONEY_LOW_LIMIT) {
      console.log('You ran out of money!  Game over.');
    } else {
      console.log('You got too much money!  Game over.');
    }
  }

  showGoodbye() {
    console.log();
    if (this.player.moneyOutOfRange()) {
      this.showMoneyResult();
    } else {
      console.log('Goodbye!');
    }
  }

  showPlayerHand() {
    console.log(`Player cards: ${this.player.handString()} (${this.player.handValue} points)`);
  }

  showDealerHand() {
    console.log(`Dealer cards: ${this.dealer.handString()} (${this.dealer.handValue} points)`);
  }

  showOneDealerCard() {
    console.log(`Dealer cards: ${this.dealer.hand[0].type.join(' of ')}, [hidden].`);
  }

  showTurnInfo() {
    console.clear();
    console.log(`Money left: ${this.player.moneyLeft} dollar(s)`);
    console.log();
    if (this.dealer.cardsHidden) {
      this.showOneDealerCard();
    } else {
      this.showDealerHand();
    }
    this.showPlayerHand();
  }

  showGameResult() {
    this.showTurnInfo();
    console.log();

    if (this.player.isBusted()) {
      console.log('You busted - the dealer won!');
    } else if (this.dealer.isBusted()) {
      console.log('The dealer busted - you won!');
    } else {
      switch (this.winner) {
        case 'player':
          console.log('You won!');
          break;
        case 'dealer':
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