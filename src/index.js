import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class App extends React.Component {
  render() {
    return(
      <div id='wrapper'>
        <Menu />
      </div>
    );
  }
}

class Menu extends React.Component{
  constructor (props){
    super (props);
    this.state = {
      game: false,
      players: 4,
      money: 500,
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
      players: 4,
      money: 500,
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
      round: 'blinds',
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
      gameIsOver: true,
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
    const raiseTimes = 5;
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

  componentDidMount(){
    this.initialDeal();
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
    for(let x = 0; x < actives.length; x++){
      for(let y = 0; y < 2; y++){
        hands[actives[x]].push(this.dealCard());
      }
    }
    const currentDeck = this.createDeck();
    const nextDealer = this.findNextDealer(actives);
    const turn = this.preFlopFirstTurn(actives, nextDealer);
    const round = 'blinds';
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
    const activeIndex = Math.floor(Math.random() * actives.length);
    const windex = actives[activeIndex];
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
    console.log(`Active Index: ${activeIndex}, Winner Index: ${windex}`);
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
              <span className='winText'>Player {actives[0]} Wins</span>
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
            {(paused  && !finished) ? <button onClick={()=>{this.handleTurn()}} className='roundButton'>Start Round</button> : null}
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
