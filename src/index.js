import React from 'react';
import ReactDOM from 'react-dom';
import './sass.scss';

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
    const p = this.props.startingPlayers;
    let list = Array(p).fill('CPU');
    list[0] = 'Player';
    this.state = {
      game: false,
      players: this.props.startingPlayers,
      playerList: list,
      money: this.props.startingMoney,
    }
    this.restart = this.restart.bind(this);
    this.setup = this.setup.bind(this);
    this.changeHumans = this.changeHumans.bind(this);
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
    const list = this.state.playerList;
    if(p > 2){
      p --;
      list.splice(p, 1);
    }
    this.setState({
      players: p,
    });
  }

  more() {
    let p = this.state.players;
    let list = this.state.playerList;
    if(p < 4){
      p ++;
      list.push('CPU');
    }
    this.setState({
      players: p,
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
  }

  componentDidMount(){
    this.setup();
  }

  getDivs() {
    const players = this.state.players;
    let divs = [];
    for(let x = 0; x < players; x++) {
      divs.push(this.getCpuDivs(x));
    }
    return divs;
  }

  getCpuDivs(x) {
    const list = this.state.playerList;
    let type = 'CPU';
    if(list[x] === 'Player') {
      type = 'P';
    }
    return (
      <Cpu type={type} key={x} num={x + 1} changeHumans={this.changeHumans}/>
    );
  }

  changeHumans(action, num){
    let list = this.state.playerList;
    if(action === 'Add') {
      list[num - 1] = 'Player';
    } else if (action === 'Subtract') {
      list[num - 1] = 'CPU';
    }
    this.setState({
      playerList: list,
    });
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
        <div>
          <div id='mainTitle'>Texas Holdem</div>
          <div id='menu'>
            <button id='startButton' onClick={() => this.start()}>Start Game</button>
            <div id='moneyDiv'> Buy In: ${val}
              <input id='moneySlider' type='range' min='100' max='1000' step='50' onChange={() => {this.getVal()}}></input>
            </div>
            <div id='playerSelect'>
              {this.getDivs()}
            </div>
            <div id='pNumHolder'>
              <button className='pNum' onClick={() => this.less()}>&lt;</button>
              <span id='players'>{p} Players</span>
              <button className='pNum' onClick={() => this.more()}>&gt;</button>
            </div>
          </div>
        </div>
        }
      </div>
    );
  }
}

class Cpu extends React.Component {
  constructor (props) {
    super(props);
    let type = this.props.type;
    let num = this.props.num;
    let stringType = type === 'P' ? type + num : type;
    this.state = {
      type: stringType,
    }
  }

  changeType() {
    const currentType = this.state.type;
    let newType;
    const num = this.props.num;
    if(currentType === 'CPU') {
      this.props.changeHumans('Add', num);
      newType = `P${num}`;
    } else {
      this.props.changeHumans('Subtract', num);
      newType = 'CPU';
    }

    this.setState({
      type: newType,
    });
  }

  render() {
    const type = this.state.type;
    return (
      <div>
        <button className='playerTypeButton' onClick={() => this.changeType()}>{type}</button>
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
    const mult = Math.floor(props.money / 20);
    const uiObject = {
      showUI: false,
      showCheckCall: true,
      showRaise: true,
      showAllIn: true,
      showFold: true,
      raise: {
        min: mult,
        max: mult * 10,
      },
      step: mult,
      checkCall: 'Check',
      diff: 0,
    };
    this.state = {
      currentDeck: this.createDeck(),
      board: [],
      round: 'blinds',
      turn: turn,
      dealer: dealer,
      moneyList: list,
      turnChoices: Array(props.players).fill('Thinking'),
      showCards: Array(props.players).fill(false),
      bet: 0,
      pot: 0,
      contributions: [0, 0, 0, 0],
      lastBet: null,
      pause: true,
      finish: false,
      blindTitles: Array(props.players).fill(null),
      handTitles: Array(props.players).fill(null),
      winnerTitles: Array(props.players).fill(null),
      activePlayers: actives,
      foldIndex: null,
      gameIsOver: false,
      playerUI: Array(props.players).fill(uiObject),
      winnerIndex: null,
    }
    this.dealCards = this.dealCards.bind(this);
    this.playerBet = this.playerBet.bind(this);
    this.showCards = this.showCards.bind(this);
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

  dealCards(num){
    let cards = [];
    const deck = this.state.currentDeck;
    let index;
    let card;
    for(let x = 0; x < num; x++) {
      index = Math.floor(Math.random() * deck.length);
      card = deck[index];
      deck.splice(index, 1);
      cards.push(
        <div className='cardContainer' key={card}>
          <div className='card'>
            {card.includes('\u2665') || card.includes('\u2666') ?
            <div className='cardText'>{card.split(' ')[0]} <span style={{color: 'red'}}>{card.split(' ')[1]}</span></div> :
            <div className='cardText'>{card}</div>}
          </div>
        </div>
      );
    }
    this.setState({
      currentDeck: deck,
    });
    return cards;
  }

  playerUI(turn, id) {
    const actives = this.state.activePlayers;
    let playerUI = this.state.playerUI;
    const turnIndex = turn - 1;
    let moneyList = this.state.moneyList;
    let money = moneyList[turnIndex];
    const raiseMult = Math.floor(money / 20);
    let cons = this.state.contributions;
    let roundAmt = cons[turnIndex];
    let ante = this.state.bet;
    let diff = ante - roundAmt;
    let choices = this.state.turnChoices;
    let choice = choices[turnIndex];
    let lastBet = this.state.lastBet;
    let min, max;
    let showRaise = true;
    let raiseAmt = diff;
    if(diff / money < .6) {
      min = raiseMult + diff;
      max = raiseMult * 9 + diff;
      raiseAmt = Math.floor(((max - min) / 2) + min);
      if(min < 10 || max > money) {
        showRaise = false;
      }
    } else {
      showRaise = false;
    }
    if(diff === 0 && choice !== 'Good' && choice !== 'Fold' && choice !== 'All In') {
      if(choice === 'Check' || choice === 'Call') {
        choice = 'Good';
      }
    }
    console.log(`Player: ${turn} - Total: ${roundAmt}, Ante: ${ante}, Diff: ${diff}`);
    choices[turnIndex] = choice;
    if(choice !== 'Good' && choice !== 'Fold' && choice !== 'All In') {
      let uiObj = {
        showUI: true,
        showCheckCall: true,
        showRaise: showRaise,
        showAllIn: true,
        showFold: true,
        raise: {
          min: min,
          max: max,
        },
        step: raiseMult,
        checkCall: diff > 0 ? 'Call' : 'Check',
        diff: diff,
      };
      if(money === 0) {
        if(diff === 0) {
          uiObj.showRaise = false;
          uiObj.showAllIn = false;
        } else {
          uiObj.showRaise = false;
          uiObj.showAllIn = false;
          uiObj.showCheckCall = false;
        }
      } else if (diff >= money) {
        uiObj.showRaise = false;
        uiObj.showCheckCall = false;
      }
      if(lastBet === turnIndex) {
        uiObj.showRaise = false;
        uiObj.showAllIn = false;
      }
      if(actives.length === 1) {
        uiObj.showRaise = false;
        uiObj.showAllIn = false;
        uiObj.showFold = false;
      }
      playerUI[turnIndex] = uiObj;
      this.setState({
        turn: turn,
        playerUI: playerUI,
        raiseAmt,
      }, () => {
        clearInterval(id);
        if(showRaise) {
          let slider = document.getElementById('raiseSlider');
          if(slider) {
            slider.value = raiseAmt;
          } else {
            setTimeout(() => {
              slider = document.getElementById('raiseSlider');
              if(slider) {
                slider.value = raiseAmt;
              }
            }, 500);
          }
        }
      });
    } else {
      let nextTurn = this.findNextTurn(null, turn, actives);
      this.setState({
        turn: nextTurn,
        turnChoices: choices,
      }, () => {
            clearInterval(id); 
            this.handleTurn();
          });
    }
  }

  showCards() {
    let turnIndex = this.state.turn - 1;
    let showCards = this.state.showCards;
    let bool;
    if(showCards[turnIndex] === true) {
      bool = false;
    } else if (showCards[turnIndex] === false) {
      bool = true;
    }
    showCards[turnIndex] = bool;
    this.setState({
      showCards: showCards,
    });
  }

  playerBet(choice, amount) {
    const actives = this.state.activePlayers;
    let turn = this.state.turn;
    const turnIndex = turn - 1;
    let choices = this.state.turnChoices;
    let moneys = this.state.moneyList;
    let money = moneys[turnIndex];
    let cons = this.state.contributions;
    let roundAmt = cons[turnIndex];
    let turnAmt = 0;
    let ante = this.state.bet;
    let pot = this.state.pot;
    let lastBet = this.state.lastBet;
    let foldIndex = null;
    let amt = parseInt(amount);
    let playerUI = this.state.playerUI;
    let diff = playerUI[turn - 1].diff;
    switch(choice) {
      case 'Call' :
        money -= amt;
        pot += amt;
        turnAmt = amt;
        break;
      case 'Raise' :
        lastBet = turnIndex;
        money -= amt;
        pot += amt;
        turnAmt = amt;
        ante += (amt - diff);
        break;
      case 'All In' :
        lastBet = turnIndex;
        ante += (money - diff);
        pot += money;
        turnAmt = money;
        money = 0;
        break;
      case 'Fold' :
        foldIndex = turnIndex;
        break;
      default :
        break;
    }
    roundAmt += turnAmt;
    choices[turnIndex] = choice;
    cons[turnIndex] = roundAmt;
    moneys[turnIndex] = money;
    let uiObj = {
      showUI: false,
      showCheckCall: true,
      showRaise: true,
      showAllIn: true,
      showFold: true,
      raise: {
        min: 0,
        max: 0,
      },
      step: 0,
      checkCall: 'Check',
      diff: 0,
    };
    playerUI[turnIndex] = uiObj;
    let nextTurn = this.findNextTurn(foldIndex, turn, actives);
    console.log(`Player: ${turn} - ${choice} Total: ${roundAmt}, Ante: ${ante}, Diff: ${uiObj.diff}`);
    this.setState({
      playerUI: playerUI,
      foldIndex: foldIndex,
      lastBet: lastBet,
      turnChoices: choices,
      contributions: cons,
      moneyList: moneys,
      pot: pot,
      bet: ante,
      turn: nextTurn,
    }, () => {this.handleTurn()});
  }

  bet(playerTurn){
    const maxMoney = this.props.money;
    const raiseTimes = 3;
    const raiseMult = Math.floor(maxMoney / 20);
    let turnIndex = playerTurn - 1;
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
    let foldIndex = null;
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
      //let choice = 0;
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
      cons[turnIndex] = roundAmt;
      this.setState({
        foldIndex: foldIndex,
        moneyList: moneyList,
        turnChoices: turnChoices,
        pot: pot,
        bet: ante,
        contributions: cons,
        lastBet: lastBet,
      });
      console.log(`Player: ${playerTurn} - ${turnChoice} Total: ${roundAmt}, Ante: ${ante}, Diff: ${diff}`);
      return foldIndex;
  }

  componentDidMount(){
    this.initialDeal();
  }

  initialDeal(){
    let hands = [[],[],[],[]];
    const actives = this.state.activePlayers;
    let numCards = actives.length * 2;
    const cards = this.dealCards(numCards);
    let x = 0;
    for(let player = 0; player < actives.length; player++){
      for(let card = 0; card < 2; card++){
        hands[player].push(cards[x]);
        x++;
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
    let foldIndex = null;
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
    let showCards = this.state.showCards;
    for(let x = 0; x < showCards.length; x++) {
      showCards[x] = false;
    }
    this.setState({
      showCards: showCards,
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
              const finish = this.finishCheck();
              let stopTheRound = this.stopCheck();
              if(stopTheRound){
                this.endBettingRound();
                clearInterval(id);
                if(!finish) {
                  const cards = this.dealCards(3);
                  for(let x = 0; x < cards.length; x++){
                    board.push(cards[x]);
                  }
                }
                this.setState({
                  finish: finish,
                  round: 'flop',
                  pause: true,
                  board: board,
                }, () => {
                  return;
                });
              } else {
                let list = this.props.playerList;
                  if(list[turn - 1] === 'Player') {
                    this.playerUI(turn, id);
                  } else {
                      foldIndex = this.bet(turn);
                      turn = this.findNextTurn(foldIndex, turn, actives);
                    }
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
              if(!finish){
                const card = this.dealCards(1);
                board.push(card[0]);
              }
              this.setState({
                finish: finish,
                round: 'turn',
                pause: true,
                board: board,
              }, () => {
                return;
              });
            } else {
              let list = this.props.playerList;
                if(list[turn - 1] === 'Player') {
                  this.playerUI(turn, id);
                } else {
                    foldIndex = this.bet(turn);
                    turn = this.findNextTurn(foldIndex, turn, actives);
                  }
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
              if(!finish){
                const card = this.dealCards(1);
                board.push(card[0]);
              }
              this.setState({
                finish: finish,
                round: 'river',
                pause: true,
                board: board,
              }, () => {
                return;
              });
            } else {
              let list = this.props.playerList;
                if(list[turn - 1] === 'Player') {
                  this.playerUI(turn, id);
                } else {
                    foldIndex = this.bet(turn);
                    turn = this.findNextTurn(foldIndex, turn, actives);
                  }
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
              let list = this.props.playerList;
                if(list[turn - 1] === 'Player') {
                  this.playerUI(turn, id);
                } else {
                    foldIndex = this.bet(turn);
                    turn = this.findNextTurn(foldIndex, turn, actives);
                  }
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

  endRound(){
    const board = [];
    let actives = [];
    const moneyList = this.state.moneyList;
    for(let x = 0; x < moneyList.length; x++){
      if(moneyList[x] > 0){
        actives.push(x);
      }
    }
    let hands = [[],[],[],[]];
    let numCards = actives.length * 2;
    const cards = this.dealCards(numCards);
    let x = 0;
    for(let player = 0; player < actives.length; player++){
      for(let card = 0; card < 2; card++){
        hands[actives[player]].push(cards[x]);
        x++;
      }
    }
    const currentDeck = this.createDeck();
    const nextDealer = this.findNextDealer(actives);
    const turn = this.preFlopFirstTurn(actives, nextDealer);
    const round = 'blinds';
    const nullArray = Array(4).fill(null);
    const choices = Array(4).fill('Thinking');
    let showCards = this.state.showCards;
    actives.forEach(index => {
      showCards[index] = false;
    });
    this.setState({
      showCards: showCards,
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
      blindTitles: nullArray.slice(),
      handTitles: nullArray.slice(),
      winnerTitles: nullArray.slice(),
      turnChoices: choices,
      activePlayers: actives,
      finish: false,
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
    let cards;
    const actives = this.state.activePlayers;
    let showCards = this.state.showCards;
    actives.forEach(index => {
      showCards[index] = true;
    });
    const id = setInterval(() => {
      switch (round) {
        case 'flop' :
          cards = this.dealCards(3);
          for(let x = 0; x < cards.length; x++){
            board.push(cards[x]);
          }
          round = 'turn';
          break;
        case 'turn' :
          cards = this.dealCards(1);
          board.push(cards[0]);
          round = 'river';
          break;
        case 'river' :
          cards = this.dealCards(1);
          board.push(cards[0]);
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
        showCards: showCards,
      });
    }, time);
  }

  winner(){
    const ranks = ['High Card', 'Pair', 'Two Pair', 'Three of a Kind', 'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Flush'];
    const actives = this.state.activePlayers;
    const pot = this.state.pot;
    const players = this.props.players;
    let bestHands = [];
    let showCards = this.state.showCards;
    let handTitles = this.state.handTitles;
    for(let x = 0; x < actives.length; x++) {
      bestHands.push([actives[x], this.getBestHand(actives[x])]);
      handTitles[actives[x]] = ranks[bestHands[x][1][0]];
    }
    actives.forEach(index => {
      showCards[index] = true;
    });
    let windexes = this.getWinningHand(bestHands);
    let winnerTitles = [];
    let moneyList = this.state.moneyList;
    for (let x = 0; x < windexes.length; x++) {
      moneyList[windexes[x]] += Math.floor(pot / windexes.length);
      for(let x = 0; x < players; x++){
        if(windexes.includes(x)){
          if(windexes.length > 1) {
            winnerTitles[x] = 'Tie';
          } else {
            winnerTitles[x] = 'Winner';
          }
        } else {
          winnerTitles[x] = null;
        }
      }
      windexes.length > 1 ? console.log(`Winners: ${windexes}`) : console.log(`Winner: ${windexes}`);
      console.log(' ');
    }
    this.setState({
      winnerTitles: winnerTitles,
      moneyList: moneyList,
      showCards: showCards,
      handTitles: handTitles,
      blindTitles: Array(4).fill(null),
    }, () => {
      const winners = this.gameOverCheck();
      if(winners.length === 1){
        let overBut = document.getElementById('gameOver');
        overBut.style.display= 'block';
        this.setState({
          winnerIndex: winners[0],
        });
      } else {
        let startBut = document.getElementById('startAgain');
        startBut.style.display = 'block';
      }
    });
  }

  getWinningHand(hands) {
    let max = [];
    let ranks = [];
    let winners = [];
    let finalWindexes = [];
    for(let x = 0; x < hands.length; x++) {
      ranks.push(hands[x][1][0]);
    }
    max = Math.max(...ranks);
    for(let x = 0; x < hands.length; x++) {
      if(hands[x][1][0] === max) {
        winners.push(hands[x]);
      }
    }
    if(winners.length > 1) {
      finalWindexes = this.tieBreaker(winners);
    } else {
      finalWindexes.push(winners[0][0]);
    }
    return finalWindexes;
  }

  tieBreaker(hands) {
    //[x][0]: index
    //[x][1][0]: rank
    //[x][1][1-5]: cards
    //straight is low -> high
    //everything else high -> low
    const high = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let highs = [];
    let valHand = [];
    let valHands = [];
    const rank = hands[0][1][0];
    let windexes = [];
    let tie = false;
    //If the best hand is not a straight or a straight flush...
    if(rank !== 8 && rank !== 4) {
      for(let x = 0; x < hands.length; x++) {
        valHand = [];
        valHand.push(hands[x][0]);
        for(let y = 1; y < 6; y++) {
          valHand.push(high.indexOf(hands[x][1][y][0]));
        }
        valHands.push([valHand]);
      }
    }
    if(rank === 9) { //Royal Flush
      tie = true;
    } else if (rank === 8 || rank === 4) { //Straight Flush & Straight
        highs = [];
        for(let x = 0; x < hands.length; x ++) {
          if(hands[x][1][5][0] === 'A') {
            highs.push(13);
          } else if (hands[x][1][5][0] === 'K') {
            highs.push(12);
          } else if (hands[x][1][5][0] === 'Q') {
            highs.push(11);
          } else if (hands[x][1][5][0] === 'J') {
            highs.push(10);
          } else {
            highs.push(hands[x][1][5][0]);
          }
        }
        let max = Math.max(...highs);
        for(let x = 0; x < highs.length; x++) {
          if(parseInt(highs[x]) === max) {
            windexes.push(hands[x][0]);
          }
        }
      } else if (rank === 5) { //Flush
          tie = true;
          for(let y = 5; y > 0; y--) {
            let highs = [];
            let bestHands = [];
            for (let x = 0; x < valHands.length; x++) {
              highs.push(valHands[x][0][y]);
            }
            let max = Math.max(...highs);
            for(let x = 0; x < highs.length; x++) {
              if(highs[x] === max) {
                bestHands.push(valHands[x]);
              }
            }
            if(bestHands.length === 1 && tie) {
              windexes.push(bestHands[0][0][0]);
              tie = false;
            }
          }
        } else { //Four of a Kind, Full House, Three of a Kind, Two Pair, Pair, High Card
            let tempHands = valHands.slice();
            for(let x = 1; x < 6; x++) {
              let highs = [];
              for(let y = 0; y < tempHands.length; y++) {
                highs.push(tempHands[y][0][x]);
              }
              let max = Math.max(...highs);
              for(let y = 0; y < tempHands.length; y++) {
                if(tempHands[y][0][x] !== max) {
                  tempHands.splice(y, 1);
                  y--;
                }
              }
            }
            for(let y = 0; y < tempHands.length; y++) {
              windexes.push(tempHands[y][0][0]);
            }
          }
    if(tie) {
      for(let x = 0; x < hands.length; x++) {
        windexes.push(hands[x][0])
      }
    }
    return windexes;
  }


  getBestHand(handIndex){
    console.log(`----- Player ${handIndex + 1} -----`);
    const high = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const ranks = ['High Card', 'Pair', 'Two Pair', 'Three of a Kind', 'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Flush'];
    let fullHands = [];
    const hands = [this.state.p1, this.state.p2, this.state.p3, this.state.p4];
    const board = this.state.board;
    const allCards = [];
    hands[handIndex].forEach(card => {
      const parts = card.key.split(' ');
      allCards.push([parts[0], parts[1]]);
    });
    board.forEach(card => {
      const parts = card.key.split(' ');
      allCards.push([parts[0], parts[1]]);
    });

    let pairs = [];
    let trips = [];
    let quads = [];

    let values = [];
    for(let x = 0; x < 7; x++) {
      values.push([high.indexOf(allCards[x][0]), allCards[x][1]]);
    }
    let cardValues = values.sort((a, b) => a[0] - b[0]);
    let sorted = [];
    for(let x = 0; x < cardValues.length; x++) {
      sorted.push([high[cardValues[x][0]], cardValues[x][1]]);
    }
    for (let x = 0; x < cardValues.length; x++) {
      if(cardValues[x][0] === 0) {
        sorted.shift();
        sorted.push(['A', cardValues[x][1]]);
      }
    }
    let matches = [];
    let match = [];
    let prev = [];
    let repeat = false;
    let added = false;
    let fullHouse = [];
    for(let x = 0; x < sorted.length; x++) {
      added = false;
      repeat = false;
      match = [];
      for(let z = 0; z < prev.length; z++) {
        if(prev[z] === sorted[x][0]) {
          repeat = true;
        }
      }
      if(!repeat) {
        for(let y = 0; y < sorted.length; y++) {
          if(sorted[x][0] === sorted[y][0] && x !== y) {
            if(!added) {
              added = true;
              match.push([sorted[x][0], sorted[x][1]]);
              prev.push(sorted[x][0]);
            }
            match.push([sorted[y][0], sorted[y][1]]);
          }
        }
        if(added) {
          matches.push(match);
        }
      }
    }
    for(let x = 0; x < matches.length; x++) {
      if(matches[x].length === 2) {
        pairs.push(matches[x]);
      }
      if(matches[x].length === 3) {
        trips.push(matches[x]);
      }
      if(matches[x].length === 4) {
        quads.push(matches[x]);
      }
    }
    let kickerLength;
    let kickers = [];
    let inUse = [];
    if(pairs.length > 1) {
      if(pairs.length > 2) {
        let extra = pairs.length - 2;
        for(let x = 0 ; x < extra; x++) {
          pairs.shift();
        }
      }
      kickerLength = 1;
      inUse = [pairs[1][0], pairs[1][1], pairs[0][0], pairs[0][1]];
      kickers = this.getKickers(kickerLength, inUse, sorted);
      console.log(`Two Pair: (${pairs[1][0][0]} ${pairs[1][0][1]}, ${pairs[1][1][0]} ${pairs[1][1][1]}), (${pairs[0][0][0]} ${pairs[0][0][1]}, ${pairs[0][1][0]} ${pairs[0][1][1]})`);
      console.log(`Kicker: ${kickers[0][0]} ${kickers[0][1]}`);
      fullHands.push([ranks.indexOf('Two Pair'), inUse[0], inUse[1], inUse[2], inUse[3], kickers[0]]);
    } else if (pairs.length === 1) {
      kickerLength = 3;
      inUse = [pairs[0][0], pairs[0][1]];
      kickers = this.getKickers(kickerLength, inUse, sorted);
      console.log(`One Pair: ${pairs[0][0][0]} ${pairs[0][0][1]}, ${pairs[0][1][0]} ${pairs[0][1][1]}`);
      console.log(`Kickers: ${kickers[0][0]} ${kickers[0][1]}, ${kickers[1][0]} ${kickers[1][1]}, ${kickers[2][0]} ${kickers[2][1]}`);
      fullHands.push([ranks.indexOf('Pair'), inUse[0], inUse[1], kickers[0], kickers[1], kickers[2]]);
    }
    if(trips.length > 0) {
      if(trips.length > 1) {
        fullHouse = [trips[1][0], trips[1][1], trips[1][2], trips[0][0], trips[0][1]];
        console.log(`Full House: ${fullHouse[0][0]} ${fullHouse[0][1]}, ${fullHouse[1][0]} ${fullHouse[1][1]}, ${fullHouse[2][0]} ${fullHouse[2][1]}, ${fullHouse[3][0]} ${fullHouse[3][1]}, ${fullHouse[4][0]} ${fullHouse[4][1]}`);
        fullHands.push([ranks.indexOf('Full House'), fullHouse[0], fullHouse[1], fullHouse[2], fullHouse[3], fullHouse[4]]);
      } else {
        if(pairs.length > 0) {
          const hPair = pairs[pairs.length - 1];
          fullHouse = [trips[0][0], trips[0][1], trips[0][2], hPair[0], hPair[1]];
          console.log(`Full House: ${fullHouse[0][0]} ${fullHouse[0][1]}, ${fullHouse[1][0]} ${fullHouse[1][1]}, ${fullHouse[2][0]} ${fullHouse[2][1]}, ${fullHouse[3][0]} ${fullHouse[3][1]}, ${fullHouse[4][0]} ${fullHouse[4][1]}`);
          fullHands.push([ranks.indexOf('Full House'), fullHouse[0], fullHouse[1], fullHouse[2], fullHouse[3], fullHouse[4]]);
        } else {
          kickerLength = 2;
          inUse = [trips[0][0], trips[0][1], trips[0][2]];
          kickers = this.getKickers(kickerLength, inUse, sorted);
          console.log(`Three of a Kind: ${trips[0][0][0]} ${trips[0][0][1]}, ${trips[0][1][0]} ${trips[0][1][1]}, ${trips[0][2][0]} ${trips[0][2][1]}`);
          console.log(`Kickers: ${kickers[0][0]} ${kickers[0][1]}, ${kickers[1][0]} ${kickers[1][1]}`);
          fullHands.push([ranks.indexOf('Three of a Kind'), inUse[0], inUse[1], inUse[2], kickers[0], kickers[1]]);
        }
      }
    }
;    if(quads.length > 0) {
      kickerLength = 1;
      inUse = [quads[0][0], quads[0][1], quads[0][2], quads[0][3]];
      kickers = this.getKickers(kickerLength, inUse, sorted);
      console.log(`Four of a Kind: ${quads[0][0][0]} ${quads[0][0][1]}, ${quads[0][1][0]} ${quads[0][1][1]}, ${quads[0][2][0]} ${quads[0][2][1]}, ${quads[0][3][0]} ${quads[0][3][1]}`);
      console.log(`Kicker: ${kickers[0][0]} ${kickers[0][1]}`);
      fullHands.push([ranks.indexOf('Four of a Kind'), inUse[0], inUse[1], inUse[2], inUse[3], kickers[0]]);
    }

    //Check for Flush

    let flush;
    let oldSuit;
    let sFlush;
    let finished = false;
    let flushValues = cardValues.slice();
    let sFlushValues = cardValues.slice();
    for (let x = 0; x < cardValues.length; x++) {
      if(cardValues[x][0] === 0) {
        flushValues.push([13, cardValues[x][1]]);
        flushValues.shift();
        sFlushValues.push([13, cardValues[x][1]]);
      }
    }
    for(let x = 0; x < flushValues.length; x++) {
      flush = [];
      flush.push([high[flushValues[x][0]], flushValues[x][1]]);
      for(let y = x; y < flushValues.length; y++) {
        if(flushValues[x][1] === flushValues[y][1] && x !== y) {
          flush.push([high[flushValues[y][0]], flushValues[y][1]]);
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
        console.log(`(Unformatted) Flush: ${flush}`);
        fullHands.push([ranks.indexOf('Flush'), flush[0], flush[1], flush[2], flush[3], flush[4]]);
      } else {
        flush = [];
      }
    }
    for(let x = 0; x < sFlushValues.length; x++) {
      sFlush = [];
      sFlush.push([sFlushValues[x][0], sFlushValues[x][1]]);
      for(let y = x; y < sFlushValues.length; y++) {
        if(sFlushValues[x][1] === sFlushValues[y][1] && x !== y) {
          sFlush.push([sFlushValues[y][0], sFlushValues[y][1]]);
        }
      }
      let straightFlush = [];
      let started = false;
      for(let y = 0; y < sFlush.length - 1; y++) {
        if(sFlush[y + 1][0] === sFlush[y][0] + 1) {
          if(!started){
            straightFlush.push([high[sFlush[y][0]], sFlush[y][1]]);
            started = true;
          }
          straightFlush.push([high[sFlush[y + 1][0]], sFlush[y + 1][1]]);
        } else {
          if(sFlush.length < 5) {
            sFlush = [];
            started = false;
          } else {
            break;
          }
        }
      }
        if(straightFlush.length > 5) {
          let extra = straightFlush.length - 5;
          for(let z = 0; z < extra; z++) {
            straightFlush.shift();
          }       
        }
        if(straightFlush.length === 5 && !finished) {
          finished = true;
          if(straightFlush[straightFlush.length - 1][0] === 'A') {
            console.log(`(Unformatted) Royal Flush: ${straightFlush}`);
            fullHands.push([ranks.indexOf('Royal Flush'), straightFlush[0], straightFlush[1], straightFlush[2], straightFlush[3], straightFlush[4]]);
          } else {
            console.log(`(Unformatted) Straight Flush: ${straightFlush}`);
            fullHands.push([ranks.indexOf('Straight Flush'), straightFlush[0], straightFlush[1], straightFlush[2], straightFlush[3], straightFlush[4]]);
          }
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
      fullHands.push([ranks.indexOf('Straight'), straight[0], straight[1], straight[2], straight[3], straight[4]]);
    } else {
      straight = [];
    }

    if(straight.length === 0 && !oldSuit) {
      const highCard = `${straightFaces[cardValues[cardValues.length - 1][0]]} ${cardValues[cardValues.length - 1][1]}`;
      kickerLength = 4;
      inUse = [sorted[sorted.length - 1]];
      kickers = this.getKickers(kickerLength, inUse, sorted);
      console.log(`High Card: ${highCard}`);
      console.log(`Kickers: ${kickers[0][0]} ${kickers[0][1]}, ${kickers[1][0]} ${kickers[1][1]}, ${kickers[2][0]} ${kickers[2][1]}, ${kickers[3][0]} ${kickers[3][1]}`);
      fullHands.push([ranks.indexOf('High Card'), inUse[0], kickers[0], kickers[1], kickers[2], kickers[3]]);
    }
    console.log(' ');
    let handRanks = [];
    for(let x = 0; x < fullHands.length; x++) {
      handRanks.push(fullHands[x][0]);
    }
    const bestIndex = Math.max(...handRanks);
    let bestHand;
    for(let x = 0; x < fullHands.length; x++) {
      if(fullHands[x][0] === bestIndex) {
        bestHand = fullHands[x];
        break;
      }
    }
    return bestHand;
  }
  
  getKickers(num, using, notUsing) {
    let kickers = [];
    let inUse;
    for(let x = notUsing.length - 1; x > -1; x--){
      inUse = false;
      for(let y = 0; y < using.length; y++) {
        if(notUsing[x][0] === using[y][0] && notUsing[x][1] === using[y][1]) {
          inUse = true;
          }
      }
      if(!inUse) {
        kickers.push(notUsing[x]);
        if(kickers.length === num) {
          return kickers;
        }
      }
    }
  }


  gameOverCheck(){
    const moneyList = this.state.moneyList;
    let winners = [];
    for(let x = 0; x < moneyList.length; x++) {
      if(moneyList[x] > 0) {
        winners.push(x);
      }
    }
    return winners;
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

  findNextTurn(foldIndex, turn, actives){
    let turnIndex = turn - 1;
    turnIndex = (actives.indexOf(turnIndex) === 0) ? actives[actives.length - 1] : actives[actives.indexOf(turnIndex) - 1];
    if(foldIndex !== null) {
      actives.splice(actives.indexOf(foldIndex), 1);
    }
    turnIndex++;
    return turnIndex;
  }

  findNextDealer(actives){
    const currentDealerIndex = this.state.dealer - 1;
    let nextDealerIndex;

    if(actives.includes(currentDealerIndex)) {
      if(actives.indexOf(currentDealerIndex) === 0) {
        nextDealerIndex = actives[actives.length - 1];
      } else {
        nextDealerIndex = actives[actives.indexOf(currentDealerIndex) - 1];
      }
    } else {
      if(currentDealerIndex === 0) {
        nextDealerIndex = actives[actives.length - 1];
      } else {
        nextDealerIndex = currentDealerIndex - 1;
      }

      if(!actives.includes(nextDealerIndex)){
        if(nextDealerIndex === 0) {
          nextDealerIndex = actives[actives.length - 1];
        } else {
          nextDealerIndex  = nextDealerIndex - 1;
        }
      }
    }
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
    let choices = this.state.turnChoices;
    actives.forEach(index => {
      if(choices[index] !== 'All In') {
        choices[index] = 'Thinking';
      }
    });
    this.setState({
      turnChoices: choices,
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
    const choices = this.state.turnChoices;
    const paused = this.state.pause;
    const finished = this.state.finish;
    const blindTitles = this.state.blindTitles;
    const actives = this.state.activePlayers;
    const gameIsOver = this.state.gameIsOver;
    const winner = this.state.winnerIndex;
    const winnerMoney = moneyList[winner];
    const list = this.props.playerList;
    const winnerPlayer = list[actives[0]];
    const playerUI = this.state.playerUI;
    const showCards = this.state.showCards;
    const handTitles = this.state.handTitles;
    const winnerTitles = this.state.winnerTitles;
    const initialRaiseAmt = this.state.raiseAmt;
    let height = window.screen.availHeight;
    let width = window.screen.availWidth;
    let landscape = width > height;
    return(
      <div>
        {gameIsOver ? 
          <div id='gameOverDisplay'>
            <div id='winnerDiv'>
              <span className='winText'>{winnerPlayer} {winner + 1} Wins!</span>
              <span className='winMoney'>${winnerMoney}</span>
            </div>
            <div id='menuButtonDiv'>
              <button className='menuButton' onClick={() => {
                this.props.restart();
                setTimeout(() => {this.props.setup()}, 10);
                }}>Play Again</button>
              {landscape ? <button className='menuButton' onClick={()=> {this.quit()}}>Quit</button> : null}
            </div>
          </div> :
          <div id='cardDisplay'>
            <button id='gameOver' onClick={()=>{this.gameOver()}} style={{display:'none'}} className='roundButton'>Game Over</button>
            <button id='startAgain' onClick={()=>{this.startNextRound()}} style={{display:'none'}} className='roundButton'>Next Round</button>
            {finished ? <button id='finishRoundButton' onClick={() => {this.finishRoundEarly()}} className='roundButton'>Finish Round</button> : null}
            {(paused  && !finished) ? <button onClick={()=>{this.handleTurn()}} className='roundButton'>Start Round</button> : null}
            <div id='board' className='cardBg'>
              <div className='cardHolder'>{board}</div>
              <div id='pot'>Pot: ${pot}</div>
            </div>
            <div id='playersArea' className='cardBg'>
                {p1 ? <Player type={list[0]} player='1' playerUI={playerUI[0]} showCards={this.showCards} show={showCards[0]} hand={p1} money={moneyList[0]} choice={choices[0]} handTitle={handTitles[0]} winner={winnerTitles[0]} blindTitle={blindTitles[0]} playerBet={this.playerBet} initialRaiseAmt={initialRaiseAmt} /> : null}
                {p2 ? <Player type={list[1]} player='2' playerUI={playerUI[1]} showCards={this.showCards} show={showCards[1]} hand={p2} money={moneyList[1]} choice={choices[1]} handTitle={handTitles[1]} winner={winnerTitles[1]} blindTitle={blindTitles[1]} playerBet={this.playerBet} initialRaiseAmt={initialRaiseAmt} /> : null}    
                {p3 ? <Player type={list[2]} player='3' playerUI={playerUI[2]} showCards={this.showCards} show={showCards[2]} hand={p3} money={moneyList[2]} choice={choices[2]} handTitle={handTitles[2]} winner={winnerTitles[2]} blindTitle={blindTitles[2]} playerBet={this.playerBet} initialRaiseAmt={initialRaiseAmt} /> : null}
                {p4 ? <Player type={list[3]} player='4' playerUI={playerUI[3]} showCards={this.showCards} show={showCards[3]} hand={p4} money={moneyList[3]} choice={choices[3]} handTitle={handTitles[3]} winner={winnerTitles[3]} blindTitle={blindTitles[3]} playerBet={this.playerBet} initialRaiseAmt={initialRaiseAmt} /> : null}        
            </div>
          </div>
        }
      </div>
    );
  }
}

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      raiseAmt: props.initialRaiseAmt,
    }
  }

  getCardBacks() {
    let cards = [];
    for (let x = 0; x < 2; x++) {
      cards.push(
        <div key={x} className='cardBack'></div>
      );
    }
    return cards;
  }

  getVal(){
    let slider = document.getElementById('raiseSlider');
    let raiseAmt = slider.value;
    this.setState({
      raiseAmt: raiseAmt,
    });
  }

  render(){
    const type = this.props.type;
    const player = this.props.player;
    const hand = this.props.hand;
    const handBack = this.getCardBacks();
    const money = this.props.money;
    const choice = this.props.choice;
    const blind = this.props.blindTitle;
    let showCards = this.props.show;
    const playerUI = this.props.playerUI;
    const raiseAmt = this.state.raiseAmt === undefined ? this.props.initialRaiseAmt : this.state.raiseAmt;
    const showUI = playerUI.showUI;
    const raise = playerUI.raise;
    const raiseStep = playerUI.step;
    const checkCall = playerUI.checkCall;
    const diff = playerUI.diff;
    const showRaise = playerUI.showRaise;
    const showCheckCall = playerUI.showCheckCall;
    const showAllIn = playerUI.showAllIn;
    const showFold = playerUI.showFold;
    const handTitle = this.props.handTitle;
    const winner = this.props.winner;
    return (
      <div className = {(choice === 'Fold') ? 'foldFade playerUI' : 'playerUI'}>
        {showUI ?
          <div className='turnUI'>
            <button className='turnButton' onClick={this.props.showCards}>Show Cards</button>
            {showAllIn ? <button className='turnButton' onClick={() => {this.props.playerBet('All In', money)}}>All In: {money}</button> : null}
            {showRaise ? <button className='turnButton' onClick={() => {this.setState({raiseAmt: undefined});this.props.playerBet('Raise', raiseAmt)}}>Raise: {raiseAmt}</button> : null}
            {showRaise ? <input id='raiseSlider' type='range' min={raise.min} max={raise.max} step={raiseStep} onChange={() => this.getVal()}></input> : null}
            {showCheckCall ? 
              checkCall === 'Call' ? <button className='turnButton' onClick={() => {this.props.playerBet('Call', diff)}}>{checkCall}: {diff}</button>
              : <button className='turnButton' onClick={() => {this.props.playerBet('Check', 0)}}>{checkCall}</button>
            : null}
            {showFold ? <button className='turnButton' onClick={() => {this.props.playerBet('Fold', 0)}}>Fold</button> : null}
          </div> : null
        }
        {blind ? <span className='blindTitle'>{blind}</span> : null}
        {winner ? <span className='winnerTitle'>{winner}</span> : null}
        {handTitle ? <span className='blindTitle'>{handTitle}</span> : null}
        <div className='playerArea'>
          <span className='playerTitle'>{type} {player}</span>
          <span className='playerChoice'>{choice}</span>
          <div className='playerInfo'>${money}</div>
          {showCards ?
            <div className='cardHolder'>{hand}</div> : 
            <div className='cardHolder'>{handBack}</div>
          }
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
