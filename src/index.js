import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//DEBUG BRANCH

class App extends React.Component {
  render() {
    const p = 4;
    const m = 500;
    return(
      <div id='wrapper'>
        <Menu startingMoney={m} startingPlayers={p}/>
      </div>
    );
  }
}

class Menu extends React.Component{
  constructor (props){
    super (props);
    this.state = {
      game: false,
      players: this.props.startingPlayers,
      money: this.props.startingMoney,
    }
    this.restart = this.restart.bind(this);
    this.setup = this.setup.bind(this);
  }

  start() {
    let but = document.getElementById('startButton');
    but.style.display = 'none';
    this.setState({
      game: true,
    });
  }

  restart() {
    this.setState({
      game: false,
      players: this.props.startingPlayers,
      money: this.props.startingMoney,
    });
  }

  less() {
    let p = this.state.players;
    if(p > 2){
      p --;
    }
    this.setState({
      players: p,
    });
    this.list(p);
  }

  more() {
    let p = this.state.players;
    if(p < 4){
      p ++;
    }
    this.setState({
      players: p,
    });
    this.list(p);
  }

  list(p){
    let list = [];
    for(let i = 0; i < p; i++){
      list.push('cpu');
    }
    this.setState({
      playerList: list,
    });
  }

  getVal(){
    let el = document.getElementById('moneySlider');
    let val = parseInt(el.value);
    this.setState({
      money: val,
    });
  }

  setup(){
    let el = document.getElementById('moneySlider');
    el.value = this.state.money;
    let p = this.state.players;
    this.list(p);
  }

  componentDidMount(){
    this.setup();
  }

  render() {
    const time = 500;
    const gameStart = this.state.game;
    const p = this.state.players;
    let val = this.state.money;
    const playerList = this.state.playerList;
    const small = (val <= 500 ? 25 : 50);
    const big = (val <= 500 ? 50 : 100);
    return(
      <div>
        {gameStart ? <Game players={p} money={val} playerList={playerList} smallBlind={small} bigBlind={big} turnTime={time} restart={this.restart} setup={this.setup}/> :
        <div id='menu'>
          <button id='startButton' onClick={() => this.start()}>Start Game</button>
          <div id='moneyDiv'> Starting Chip Value: {val}
            <input id='moneySlider' type='range' min='100' max='1000' step='50' onChange={() => {this.getVal()}}></input>
          </div>
          <div id='pNumHolder'>
            <button className='pNum' onClick={() => this.less()}>&lt;</button>
            <span id='players'>{p} Players</span>
            <button className='pNum' onClick={() => this.more()}>&gt;</button>
          </div>
        </div>
        }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    let list = Array(props.players).fill(props.money);
    let actives = [];
    const dealer = 1;
    for(let i = 0; i < props.players; i++){
      actives.push(i);
    }
    let turn = this.preFlopFirstTurn(actives, dealer);
    this.state = {
      currentDeck: this.createDeck(),
      board: [],
      round: 'river',
      turn: turn,
      dealer: dealer,
      moneyList: list,
      turnChoices: Array(props.players).fill('Thinking'),
      bet: 0,
      pot: 0,
      contributions: [0, 0, 0, 0],
      lastBet: null,
      pause: true,
      finish: false,
      blindTitles: Array(props.players).fill(null),
      activePlayers: actives,
      foldIndex: null,
      gameIsOver: false,
    }
    this.dealCard = this.dealCard.bind(this);
  }

  preFlopFirstTurn(actives, dealer) {
    const x = actives.length;
    let turn;
    if(x === 2) {
      turn = dealer;
    } else if (x === 3){
      turn = dealer;
    } else if (x === 4){
      if(dealer < x) {
        let tempTurn = dealer + 1;
        turn = actives[actives.indexOf(tempTurn - 1)];
        turn++;
      } else {
        let tempTurn = 1;
        turn = actives[actives.indexOf(tempTurn - 1)];
        turn++;
      }
    }
    return turn;
  }

  createDeck(){
    const faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suits = ['\u2660', '\u2663', '\u2665', '\u2666'];
    const fullDeck = [];
    suits.forEach(suit => {
      faces.forEach(face => {
        fullDeck.push(`${face} ${suit}`);
      });
    });
    return fullDeck;
  }

  dealCard(){
    const deck = this.state.currentDeck;
    let index = Math.floor(Math.random() * deck.length);
    let card = deck[index];
    deck.splice(index, 1);

    this.setState({
      currentDeck: deck,
    });
    return (
      <div className='cardContainer' key={card}>
        <div className='card'>
          {card.includes('\u2665') || card.includes('\u2666') ?
          <div className='cardText'>{card.split(' ')[0]} <span style={{color: 'red'}}>{card.split(' ')[1]}</span></div> :
          <div className='cardText'>{card}</div>}
        </div>
      </div>
    );
  }

  bet(playerTurn){
    const maxMoney = this.props.money;
    const raiseTimes = 3;
    const raiseMult = maxMoney / 10;
    let turnIndex = playerTurn - 1;
    const player = this.props.playerList[turnIndex];
    let moneyList = this.state.moneyList;
    let money = moneyList[turnIndex];
    let cons = this.state.contributions;
    let roundAmt = cons[turnIndex];
    let turnAmt = 0;
    let turnChoices = this.state.turnChoices;
    let turnChoice = turnChoices[turnIndex];
    let ante = this.state.bet;
    let pot = this.state.pot;
    let diff = ante - roundAmt;
    let lastBet = this.state.lastBet;
    let actives = this.state.activePlayers;
    let foldIndex = this.state.foldIndex;
    console.log(`Player: ${playerTurn} - Total: ${roundAmt}, Ante: ${ante}, Diff: ${diff}`);

    if(player === 'cpu'){
      if(money === 0){
        if(diff > 0){
          turnChoice = 'Fold';
          foldIndex = turnIndex;
        }
      }
      if(diff === 0 && turnChoice !== 'Fold' && turnChoice !== 'Good' && turnChoice !== 'All In'){
        if(turnChoice === 'Check' || turnChoice === 'Call'){
          turnChoice = 'Good';
        }
      }
      if(diff !== 0 && turnChoice !== 'Fold'){
        turnChoice = '';
      }
      if(turnChoice !== 'Good' && turnChoice !== 'Fold' && turnChoice !== 'All In'){
        let choice = Math.floor(Math.random() * 3);
        switch (choice) {
          case 0:
            //Check / Call
            if(diff === 0){
              turnChoice = 'Check';
            }
            else if(money <= diff){
              turnAmt = money;
              pot += money;
              money = 0;
              turnChoice = 'All In';
            } else if(diff > 0 && money > diff) {
              pot += diff;
              money -= diff;
              turnChoice = 'Call';
              turnAmt = diff;
            }
            roundAmt += turnAmt;
            break;
          case 1:
            //Raise
              if(diff >= money){
                turnAmt = money;
                pot += money;
                money = 0;
                turnChoice = 'All In';
              } else {
                  if (lastBet !== turnIndex) {
                    lastBet = turnIndex;
                    let raise = (Math.floor(Math.random() * raiseTimes) + 1) * raiseMult;
                    if((diff + raise) >= money){
                      raise = (money - diff);
                      ante += raise;
                      turnAmt = money;
                      pot += money;
                      money = 0;
                      turnChoice = 'All In';
                    } else {
                      ante += raise;
                      turnAmt = diff + raise;
                      pot += turnAmt;
                      money -= turnAmt;
                      turnChoice = 'Raise';
                      }
                    } else {
                      if(diff === 0) {
                        turnChoice = 'Check';
                      } else {
                        turnAmt = diff;
                        money -= diff;
                        pot += diff;
                        turnChoice = 'Call';
                      }
                    }
                  }
                  roundAmt += turnAmt;
            break;
          case 2:
            //Fold
            if(diff === 0){
              turnChoice = 'Check';
            } else {
              turnChoice = 'Fold';
              foldIndex = turnIndex;
            }
            break;
          default:
            break;
        }
      }
      moneyList[turnIndex] = money;
      turnChoices[turnIndex] = turnChoice;
      diff = ante - roundAmt;
      console.log(`${turnChoice} ${turnAmt} Diff: ${diff} ${foldIndex}`);
      cons[turnIndex] = roundAmt;
      this.setState({
        foldIndex: foldIndex,
        moneyList: moneyList,
        turnChoices: turnChoices,
        pot: pot,
        bet: ante,
        contributions: cons,
        lastBet: lastBet,
        activePlayers: actives,
      });
    }
  }

  initialDeal(){
    let hands = [[],[],[],[]];
    const actives = this.state.activePlayers;
    for(let x = 0; x < actives.length; x++){
      for(let y = 0; y < 2; y++){
        hands[actives[x]].push(this.dealCard());
      }
    }
    this.setState({
      p1: hands[0],
      p2: hands[1],
      p3: hands[2],
      p4: hands[3],
    }, () => {
    });
  }

  handleTurn(){
    const turnTime = this.props.turnTime;
    let board = this.state.board;
    let turn = this.state.turn;
    let round = this.state.round;
    let id;
    let dealer = this.state.dealer;
    let dealerIndex = dealer - 1;
    let blindTitles = this.state.blindTitles;
    let moneyList = this.state.moneyList;
    const big = this.props.bigBlind;
    const small = this.props.smallBlind;
    let pot = this.state.pot;
    let cons = this.state.contributions;
    let ante = this.state.bet;
    const actives = this.state.activePlayers;
    let choices = this.state.turnChoices;
    actives.forEach((index)=>{
      if(choices[index] !== 'All In'){
        choices[index] = 'Thinking';
      }
    });
    this.setState({
      pause: false,
      turnChoices: choices,
    }, () => {
      switch (round) {
        case 'blinds' :
          setTimeout(() => {
            let actives = this.state.activePlayers;
            let finalSmallIndex;
            let finalBigIndex;
            if(actives.length === 2){
              finalSmallIndex = actives[actives.indexOf(dealerIndex)];
              if(actives.indexOf(dealerIndex) === 0){
                finalBigIndex = actives[actives.length - 1];
              } else {
                finalBigIndex = actives[actives.indexOf(dealerIndex) - 1];
              }
              blindTitles[finalSmallIndex] = 'Dealer / Small Blind';
              blindTitles[finalBigIndex] = 'Big Blind';
              console.log(`Dealer Index: ${dealerIndex}, Small Index: ${finalSmallIndex}, Big Index: ${finalBigIndex}`);
            } else {
                blindTitles[actives[actives.indexOf(dealerIndex)]] = 'Dealer';
                let smallIndex = actives.indexOf(dealerIndex) - 1;
                let bigIndex = actives.indexOf(dealerIndex) - 2;
                if(smallIndex < 0){
                  smallIndex += actives.length;
                }
                if(bigIndex < 0){
                  bigIndex += actives.length;
                }
                finalSmallIndex = actives[smallIndex];
                finalBigIndex = actives[bigIndex];
                blindTitles[finalSmallIndex] = 'Small Blind';
                blindTitles[finalBigIndex] = 'Big Blind';
            }
  
            if(moneyList[finalSmallIndex] <= small) {
              let amt = moneyList[finalSmallIndex];
              cons[finalSmallIndex] = amt;
              ante = amt;
              pot += amt;
              moneyList[finalSmallIndex] = 0;
            } else {
              pot += small;
              moneyList[finalSmallIndex] -= small;
              cons[finalSmallIndex] = small;
              ante = small;
            }
  
            if(moneyList[finalBigIndex] <= big){
              let amt = moneyList[finalBigIndex];
              cons[finalBigIndex] = amt;
              if(ante < amt) {
                ante = amt;
              }
              pot += amt;
              moneyList[finalBigIndex] = 0;
            } else {
              cons[finalBigIndex] = big;
              ante = big;
              pot += big;
              moneyList[finalBigIndex] -= big;
            }
  
            round = 'preFlop';
  
            this.setState({
              blindTitles: blindTitles,
              round: round,
              pause: true,
              moneyList: moneyList,
              pot: pot,
              contributions: cons,
              bet: ante,
            });
          }, turnTime);
          break;
  
        case 'preFlop' : 
            id = setInterval(() => {
              let actives = this.state.activePlayers;
              const finish = this.finishCheck();
              let stopTheRound = this.stopCheck();
              if(stopTheRound){
                this.endBettingRound();
                clearInterval(id);
                if(!finish) {
                  for(let x = 0; x < 3; x++){
                    board.push(this.dealCard());
                  }
                }
                this.setState({
                  finish: finish,
                  round: 'flop',
                  pause: true,
                }, () => {
                  return;
                });
              } else {
              this.bet(turn);
              turn = this.findNextTurn(turn, actives);
              }
            }, turnTime);
          break;
  
        case 'flop' :
          id = setInterval(() => {
            let actives = this.state.activePlayers;
            const finish = this.finishCheck(); 
            let stopTheRound = this.stopCheck();
            if(stopTheRound){
              this.endBettingRound();
              clearInterval(id);
              if(!finish){board.push(this.dealCard());}
              this.setState({
                finish: finish,
                round: 'turn',
                pause: true,
              }, () => {
                return;
              });
            } else {
              this.bet(turn);
              turn = this.findNextTurn(turn, actives);
            }
          }, turnTime);
          break;
  
        case 'turn' :
          id = setInterval(() => {
            const finish = this.finishCheck();
            let actives = this.state.activePlayers;
            let stopTheRound = this.stopCheck();
            if(stopTheRound){
              this.endBettingRound();
              clearInterval(id);
              if(!finish){board.push(this.dealCard());}
              this.setState({
                finish: finish,
                round: 'river',
                pause: true,
              }, () => {
                return;
              });
            } else {
              this.bet(turn);
              turn = this.findNextTurn(turn, actives);
            }
          }, turnTime);
          break;
  
        case 'river' :
          id = setInterval(() => {
            let actives = this.state.activePlayers;
            let stopTheRound = this.stopCheck();
            if(stopTheRound){
              this.endBettingRound();
              clearInterval(id);
              setTimeout(() => {
                this.winner()
              }, turnTime);
            } else {
              this.bet(turn);
              turn = this.findNextTurn(turn, actives);
            }
          }, turnTime);
          break;
        default :
        break;
      }
    });
  }

  stopCheck(){
    let stop = true;
    const actives = this.state.activePlayers;
    const choices = this.state.turnChoices;
    actives.forEach((index) => {
      if(choices[index] !== 'Good' && choices[index] !== 'Fold' && choices[index] !== 'All In'){
        stop = false;
      }
    });
    return stop;
  }

  finishCheck(){
    const actives = this.state.activePlayers;
    const choices = this.state.turnChoices;
    let allIn = true;
    actives.forEach((index) => {
      if(choices[index] !== 'All In') {
        allIn = false;
      }
    });
    if(actives.length === 1 || allIn){
      return true;
    }
    return false;
  }

  createCard(face, suit) {
    const string = `${face} ${suit}`;
    return (
      <div className='cardContainer' key={string}>
        <div className='card'>
          <div className='cardText'>{string}</div>
        </div>
      </div>
    );
  }

  endRound(){
    const suits = ['\u2660', '\u2663', '\u2665', '\u2666'];
    const board = [[this.createCard('2', suits[0])], [this.createCard('2', suits[3])], [this.createCard('5', suits[3])], [this.createCard('4', suits[3])], [this.createCard('3', suits[0])]];
    let actives = [];
    const moneyList = this.state.moneyList;
    for(let x = 0; x < moneyList.length; x++){
      if(moneyList[x] > 0){
        actives.push(x);
      }
    }
    let hands = [[[this.createCard('3', suits[3])], [this.createCard('A', suits[3])]],[[this.createCard('3', suits[1])], [this.createCard('4', suits[2])]],[[this.createCard('3', suits[0])], [this.createCard('2', suits[1])]],[[this.createCard('7', suits[3])], [this.createCard('5', suits[2])]]];
    const currentDeck = this.createDeck();
    const nextDealer = this.findNextDealer(actives);
    const turn = this.preFlopFirstTurn(actives, nextDealer);
    const round = 'winner';
    const nullArray = Array(4).fill(null);
    const choices = Array(4).fill('Thinking');
    this.setState({
      dealer: nextDealer,
      turn: turn,
      round: round,
      pause: true,
      currentDeck: currentDeck,
      board: board,
      bet: 0,
      pot: 0,
      lastBet: null,
      contributions: Array(4).fill(0),
      blindTitles: nullArray,
      turnChoices: choices,
      activePlayers: actives,
      finish: true,
      p1: hands[0],
      p2: hands[1],
      p3: hands[2],
      p4: hands[3],
    });
  }

  finishRoundEarly(){
    let round = this.state.round;
    let time = this.props.turnTime;
    time *= 1.5;
    let board = this.state.board;
    let but = document.getElementById('finishRoundButton');
    but.style.display = 'none';
    const id = setInterval(() => {
      switch (round) {
        case 'flop' :
          for(let x = 0; x < 3; x++){
            board.push(this.dealCard());
          }
          round = 'turn';
          break;
        case 'turn' :
          board.push(this.dealCard());
          round = 'river';
          break;
        case 'river' :
          board.push(this.dealCard());
          round = 'winner';
          break;
        case 'winner' :
          round = null;
          this.winner();
          clearInterval(id);
          break;
        default:
          break;
      }
      this.setState({
        board: board,
      });
    }, time);
  }

  winner(){
    const actives = this.state.activePlayers;
    const pot = this.state.pot;
    const players = this.props.players;
    let bestHands = [];
    actives.forEach((index) => {
      bestHands.push(this.getBestHand(index));
    });
    const windex = this.getWinningHand(bestHands);
    let blindTitles = [];
    let moneyList = this.state.moneyList;
    moneyList[windex] += pot;
    for(let x = 0; x < players; x++){
      if(x === windex){
        blindTitles[x] = 'Winner';
      } else {
        blindTitles[x] = '';
      }
    }
    this.setState({
      blindTitles: blindTitles,
      moneyList: moneyList,
    }, () => {
      const over = this.gameOverCheck();
      console.log(`gameOver=${over}`);
      if(over){
        let overBut = document.getElementById('gameOver');
        overBut.style.display= 'block';
      } else {
        let startBut = document.getElementById('startAgain');
        startBut.style.display = 'block';
      }
    });
  }

  getBestHand(handIndex){
    let bestHand = [];
    const hands = [this.state.p1, this.state.p2, this.state.p3, this.state.p4];
    const board = this.state.board;
    const allCards = [];
    hands[handIndex].forEach(card => {
      const parts = card[0].key.split(' ');
      allCards.push([parts[0], parts[1]]);
    });
    board.forEach(card => {
      const parts = card[0].key.split(' ');
      allCards.push([parts[0], parts[1]]);
    });
    let allMatches = [];
    let matchedIndexes = [];
    let allFormattedMatches = [];
    //Check for Pair, Two Pair, Three of a Kind, Four of a Kind, and Full House
    for (let x = 0; x < 7; x++){
      let matched = false;
      let matches = [[]];
      let formattedMatch = [[]];
      for (let y = 0; y < 7; y ++){
        if(allCards[x][0] === allCards[y][0] && x !== y && matchedIndexes.indexOf(x) === -1){
          if(!matched){
            matched = true;
            matches[0].push(allCards[x][0]);
            formattedMatch[0].push(`${allCards[x][0]} ${allCards[x][1]}`);
          }
          matches[0].push(allCards[y][0]);
          formattedMatch[0].push(`${allCards[y][0]} ${allCards[y][1]}`);
          matchedIndexes.push(y);
        }
      }
      if(matches[0].length > 0) {
        allMatches.push(matches[0]);
        allFormattedMatches.push(formattedMatch[0]);
      }
      matches = [];
    }
    //TODO add pairs to array, sort by value, and return highest two if possible
    let pairLength;
    let pairs = 0;
    console.log(`Player ${handIndex + 1} Matches:`);
    for(let x = 0; x < allMatches.length; x++){
      let fullHouse = false;
      let specialMatch = [];
      let specialForm = [];
      if(allMatches[x].length === 2) {
        pairLength = 'One Pair';
        pairs++;
      } else if(allMatches[x].length === 3) {
        for(let y = 0; y < allMatches.length; y++) {
          if(allMatches[y].length === 2) {
            fullHouse = true;
            specialMatch.push(allMatches[y]);
            specialForm.push(allFormattedMatches[y]);
          }
        }
        if(fullHouse) {
          pairLength = 'Full House';
          specialMatch.unshift(allMatches[x]);
          specialForm.unshift(allFormattedMatches[x]);
        } else {
          pairLength = 'Three of a Kind';
        }
      } else if (allMatches[x].length === 4) {
        pairLength = 'Four of a Kind';
      }
      if(pairs > 1) {
        pairLength = 'Two Pair';
      }
      console.log(`${pairLength} (${fullHouse ? specialForm : allFormattedMatches[x]})`);
    }

    //Check for Flush

    let values = [];
    const high = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    for(let x = 0; x < 7; x++) {
      values.push([high.indexOf(allCards[x][0]), allCards[x][1]]);
    }
    let cardValues = values.sort((a, b) => a[0] - b[0]);
    let flush;
    let oldSuit;
    let sFlush;
    for(let x = 0; x < cardValues.length; x++) {
      flush = [];
      sFlush = [];
      flush.push(`${high[cardValues[x][0]]} ${cardValues[x][1]}`);
      sFlush.push([cardValues[x][0], cardValues[x][1]]);
      for(let y = 0; y < cardValues.length; y++) {
        if(cardValues[x][1] === cardValues[y][1] && x !== y) {
          flush.push(`${high[cardValues[y][0]]} ${cardValues[y][1]}`);
          sFlush.push([cardValues[y][0], cardValues[y][1]]);
        }
      }
      let straightFlush = [];
      let started = false;
      for(let y = 0; y < sFlush.length - 1; y++) {
        if(sFlush[y + 1][0] === sFlush[y][0] + 1) {
          if(!started){
            straightFlush.push(`${high[sFlush[y][0]]} ${sFlush[y][1]}`);
            started= true;
          }
          straightFlush.push(`${high[sFlush[y + 1][0]]} ${sFlush[y + 1][1]}`);
        } else if (sFlush[y + 1][0] !== sFlush[y][0]){
          if(sFlush.length < 5) {
            sFlush = [];
          } else {
            break;
          }
        }
        if(straightFlush.length > 5) {
          let extra = straightFlush.length - 5;
          for(let z = 0; z < extra; z++) {
            straightFlush.shift();
          }          
        }
        if(straightFlush.length === 5) {
          console.log(`Straight Flush: ${straightFlush}`);
        }
      }
      if(flush.length > 5) {
        let extra = flush.length - 5;
        for(let z = 0; z < extra; z++) {
          flush.shift();
        }
      }
      if(flush.length === 5 && cardValues[x][1] !== oldSuit) {
        oldSuit = cardValues[x][1];
        console.log(`Flush: ${flush}`);
      } else {
        flush = [];
      }
    }

    const straightFaces = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    values = [];
    for(let x = 0; x < 7; x++) {
      values.push([straightFaces.indexOf(allCards[x][0]), allCards[x][1]]);
    }
    let ace = false;
    for(let x = 0; x < values.length; x++){
      if(values[x][0] === 0 && !ace) {
        ace = true;
        values.push([13, allCards[x][1]]);
      }
    }

    cardValues = values.sort((a, b) => a[0] - b[0]);
    let straight = [];
    let started = false;
    for(let x = 0; x < cardValues.length - 1; x++){
      if(cardValues[x + 1][0] === (cardValues[x][0] + 1)) {
        if(!started) {
          straight.push([straightFaces[cardValues[x][0]], cardValues[x][1]]);
          started = true;
        }
        straight.push([straightFaces[cardValues[x + 1][0]], cardValues[x + 1][1]]);
      } else if (cardValues[x + 1][0] !== cardValues[x][0]) {
          if (straight.length < 5) {
          straight = [];
          started = false;
          } else {
              break;
            }
        }
    }
    if(straight.length > 5) {
      const extra = straight.length - 5;
      for(let x = 0; x < extra; x++) {
        straight.shift();
      }
    }
    
    if(straight.length === 5) {
      let formattedStraight = [];
      for(let x = 0; x < straight.length; x++) {
        formattedStraight.push(`${straight[x][0]} ${straight[x][1]}`);
      }
      console.log(`Straight: ${formattedStraight}`);
    } else {
      straight = [];
    }

    if(allMatches.length === 0 && straight.length === 0 && !oldSuit) {
      const highCard = `${straightFaces[cardValues[cardValues.length - 1][0]]} ${cardValues[cardValues.length - 1][1]}`;
      console.log(`High Card: ${highCard}`);
    }
    return bestHand;
  }

  getWinningHand(handValues) {
    let winningIndex;
    return winningIndex;
  }

  gameOverCheck(){
    const moneyList = this.state.moneyList;
    let activeNum = 0;
    moneyList.forEach((money) => {
      if(money > 0) {
        activeNum++;
      }
    });
    console.log(`active player count: ${activeNum}`);
    if(activeNum === 1){
      return true;
    }
    return false;
  }

  gameOver(){
    let overBut = document.getElementById('gameOver');
    overBut.style.display = 'none';
    this.setState({
      gameIsOver: true,
    });
  }

  startNextRound(){
    let startBut = document.getElementById('startAgain');
    startBut.style.display = 'none';
    this.endRound();
  }

  findNextTurn(turn, actives){
    let foldIndex = this.state.foldIndex;
    let turnIndex = turn - 1;
    turnIndex = (actives.indexOf(turnIndex) === 0) ? actives[actives.length - 1] : actives[actives.indexOf(turnIndex) - 1];
    if(foldIndex !== null) {
      actives.splice(actives.indexOf(foldIndex), 1);
      this.setState({
        foldIndex: null,
      });
    }
    return turnIndex + 1;
  }

  findNextDealer(actives){
    const currentDealerIndex = this.state.dealer - 1;
    let nextDealerIndex;
    console.log(`---Current Dealer Index: ${currentDealerIndex}---`);

    if(actives.includes(currentDealerIndex)) {
      console.log(`index ${currentDealerIndex} was on active list`);
      if(actives.indexOf(currentDealerIndex) === 0) {
        console.log('0 -> last active index');
        nextDealerIndex = actives[actives.length - 1];
      } else {
        nextDealerIndex = actives[actives.indexOf(currentDealerIndex) - 1];
        console.log(`set to index ${nextDealerIndex}`);
      }
    } else {
      console.log(`index ${currentDealerIndex} inactive`);
      if(currentDealerIndex === 0) {
        console.log('0 -> last active index');
        nextDealerIndex = actives[actives.length - 1];
      } else {
        nextDealerIndex = currentDealerIndex - 1;
        console.log(`Check index ${nextDealerIndex}`);
      }

      if(!actives.includes(nextDealerIndex)){
        console.log(`index ${nextDealerIndex} also inactive`);
        if(nextDealerIndex === 0) {
          console.log('0 -> last active index');
          nextDealerIndex = actives[actives.length - 1];
        } else {
          nextDealerIndex  = nextDealerIndex - 1;
          console.log(`set to index ${nextDealerIndex}`);
        }
      }
    }


    console.log(`---Next Dealer Index: ${nextDealerIndex}---`);
    const nextDealer = nextDealerIndex + 1;
    return nextDealer;

  }

  endBettingRound(){
    let bet = this.state.bet;
    let con = this.state.contributions;
    let last = this.state.lastBet;
    const players = this.props.players;
    const actives = this.state.activePlayers;
    bet = 0;
    con = Array(players).fill(0);
    last = null;
    const turn = this.findNextDealer(actives);
    console.log(`Under The Gun Index: ${turn - 1}`);
    this.setState({
      bet: bet,
      contributions: con,
      lastBet: last,
      turn: turn,
    });
  }

  quit(){
    window.open('', '_self', '').close();
  }

  render(){
    const board = this.state.board;
    let p1 = this.state.p1;
    let p2 = this.state.p2;
    let p3 = this.state.p3;
    let p4 = this.state.p4;
    if(p1 && p1.length === 0) {
      p1 = null;
    }
    if(p2 && p2.length === 0) {
      p2 = null;
    }
    if(p3 && p3.length === 0) {
      p3 = null;
    }
    if(p4 && p4.length === 0) {
      p4 = null;
    }
    const moneyList = this.state.moneyList;
    const pot = this.state.pot;
    const ante = this.state.bet;
    const choices = this.state.turnChoices;
    const paused = this.state.pause;
    const finished = this.state.finish;
    const blindTitles = this.state.blindTitles;
    const actives = this.state.activePlayers;
    const gameIsOver = this.state.gameIsOver;
    const winnerMoney = moneyList[actives[0]];
    return(
      <div>
        {gameIsOver ? 
          <div id='gameOverDisplay'>
            <div id='winnerDiv'>
              <span className='winText'>Player {actives[0] + 1} Wins</span>
              <span className='winText'>${winnerMoney}</span>
            </div>
            <div id='menuButtonDiv'>
              <button className='menuButton' onClick={() => {
                this.props.restart();
                setTimeout(() => {this.props.setup()}, 10);
                }}>Play Again</button>
              <button className='menuButton' onClick={()=> {this.quit()}}>Quit</button>
            </div>
          </div> :
          <div id='cardDisplay'>
            <button id='gameOver' onClick={()=>{this.gameOver()}} style={{display:'none'}} className='roundButton'>Game Over</button>
            <button id='startAgain' onClick={()=>{this.startNextRound()}} style={{display:'none'}} className='roundButton'>Start Next Round</button>
            {finished ? <button id='finishRoundButton' onClick={() => {this.finishRoundEarly()}} className='roundButton'>Finish Round</button> : null}
            {(paused  && !finished) ? <button onClick={()=>{this.startNextRound()}} className='roundButton'>Start Round</button> : null}
            <div id='board' className='cardHolder'>{board}</div>
            <div id='pot'>Pot: {pot} Ante: {ante}</div>
            <div id='playersArea'>
                {p1 ? <Player player='1' hand={p1} money={moneyList[0]} choice={choices[0]} blindTitle={blindTitles[0]}/> : null}
                {p2 ? <Player player='2' hand={p2} money={moneyList[1]} choice={choices[1]} blindTitle={blindTitles[1]}/> : null}    
                {p3 ? <Player player='3' hand={p3} money={moneyList[2]} choice={choices[2]} blindTitle={blindTitles[2]}/> : null}
                {p4 ? <Player player='4' hand={p4} money={moneyList[3]} choice={choices[3]} blindTitle={blindTitles[3]}/> : null}        
            </div>
          </div>
        }
      </div>
    );
  }
}

class Player extends React.Component {

  render(){
    const player = this.props.player;
    const hand = this.props.hand;
    const money = this.props.money;
    const title = this.props.title;
    const choice = this.props.choice;
    const blind = this.props.blindTitle;
    return (
      <div className = {(choice === 'Fold') ? 'foldFade' : null}>
        {blind ? <span className='blindTitle'>{blind}</span> : null}
        <div className='playerArea'>
          <span>{title ? title : null}</span>
          <span style={{display: 'block'}}>Player {player}</span>
          <span>{choice}</span>
          <div className='playerInfo'>{money}</div>
          <div className='cardHolder'>{hand}</div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
