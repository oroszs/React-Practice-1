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
      money: 1000,
    }
  }

  start() {
    let but = document.getElementById('startButton');
    but.style.display = 'none';
    this.setState({
      game: true,
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

  componentDidMount(){
    let el = document.getElementById('moneySlider');
    el.value = this.state.money;
    let p = this.state.players;
    this.list(p);
  }

  render() {
    const gameStart = this.state.game;
    const p = this.state.players;
    let val = this.state.money;
    const playerList = this.state.playerList;
    return(
      <div>
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
        {gameStart ? <Game players={p} money={val} playerList={playerList}/> : null}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    let list = Array(props.players).fill(props.money);
    let actives = [];
    let turn;
    if(props.players === 2) {
      turn = 1;
    } else if (props.players === 3){
      turn = 1;
    } else if (props.players === 4){
      turn = 2;
    }
    for(let i = 0; i < props.players; i++){
      actives.push(i);
    }
    this.state = {
      currentDeck: this.createDeck(),
      board: [],
      round: 'blinds',
      turn: turn,
      dealer: 1,
      moneyList: list,
      turnChoices: Array(props.players).fill('Thinking'),
      bet: 0,
      pot: 0,
      contributions: [0, 0, 0, 0],
      lastBet: null,
      pause: true,
      blindTitles: Array(props.players).fill(null),
      activePlayers: actives,
    }
    this.dealCards = this.dealCards.bind(this);
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
    for(let x = 0; x < num; x++){
      let index = Math.floor(Math.random() * deck.length);
      let card = deck[index];
      deck.splice(index, 1);
      cards.push(card);
    }
    this.setState({
      currentDeck: deck,
    });
    return cards;
  }

  createCards(cards, deck){
    let divCards = [];
    for(let x = 0; x < cards.length; x++){
      divCards.push(
        <div className='cardContainer' key={cards[x]} >
          <div className={deck ? 'deckCard' : 'card'} >
            {cards[x].includes('\u2665') || cards[x].includes('\u2666') ?
            <div className={deck ? 'deckCardText' : 'cardText'}>{cards[x].split(' ')[0]} <span style={{color: 'red'}}>{cards[x].split(' ')[1]}</span></div> :
            <div className={deck ? 'deckCardText' : 'cardText'}>{cards[x]}</div>}
          </div>
        </div>
      );
    }
    return divCards;
  }

  bet(playerTurn){
    const maxMoney = this.props.money;
    const raiseTimes = 4;
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
    console.log(`Player: ${playerTurn} (${status}) - Total: ${roundAmt}, Ante: ${ante}, Diff: ${diff}`);

    if(player === 'cpu'){
      if(money === 0){
        if(diff > 0){
          turnChoice = 'Fold';
          actives.splice(actives.indexOf(turnIndex), 1);
        } else {
          turnChoice = 'Check';
        }
      }
      if(diff === 0 && turnChoice !== 'Fold' && turnChoice !== 'Good'){
        if(turnChoice === 'Check' || turnChoice === 'Call'){
          turnChoice = 'Good';
        }
      }
      if(diff !== 0 && turnChoice !== 'Fold'){
        turnChoice = '';
      }
      if(turnChoice !== 'Good' && turnChoice !== 'Fold'){
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
              turnChoice = 'Call';
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
            if(diff > 0 && diff === money){
              turnChoice = 'Call';
              turnAmt = money;
              pot += money;
              money = 0;
              roundAmt += turnAmt;
            } else {
              if (lastBet !== turnIndex) {
                lastBet = turnIndex;
                  let raise = (Math.floor(Math.random() * raiseTimes) + 1) * raiseMult;
                  if((diff + raise) > money){
                    raise = (money - diff);
                    ante += raise;
                    turnAmt = money;
                    pot += money;
                    money = 0;
                    turnChoice = 'Raise All In';
                    roundAmt += turnAmt;
                  } else {
                    ante += raise;
                    turnAmt = diff + raise;
                    pot += turnAmt;
                    money -= turnAmt;
                    turnChoice = 'Raise';
                    roundAmt += turnAmt;
                  }
              } else {
                turnChoice = 'Check';
              }
            }
            break;
          case 2:
            //Fold
            if(diff === 0){
              turnChoice = 'Check';
            } else {
              turnChoice = 'Fold';
              actives.splice(actives.indexOf(turnIndex), 1);
            }
            break;
          default:
            break;
        }
      }
      moneyList[turnIndex] = money;
      turnChoices[turnIndex] = turnChoice;
      diff = ante - roundAmt;
      console.log(`${turnChoice} ${turnAmt} Diff: ${diff}`);
      cons[turnIndex] = roundAmt;
      this.setState({
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
    let hands = []; 
    const players = this.props.players;
    for(let i = 0; i < players; i++){
      hands.push(this.createCards(this.dealCards(2), false));
    }
    const deck = this.createCards(this.state.currentDeck, true);
    this.setState({
      p1: hands[0],
      p2: hands[1],
      p3: hands[2],
      p4: hands[3],
      deck: deck,
    });
  }

  handleTurn(){
    let turnTime = 1;
    turnTime *= 1000;
    let board = this.state.board;
    let turn = this.state.turn;
    let round = this.state.round;
    let id;
    let dealer = this.state.dealer;
    let dealerIndex = dealer - 1;
    let blindTitles = this.state.blindTitles;
    const actives = this.state.activePlayers;
    this.setState({
      pause: false,
    });
    switch (round) {
      case 'blinds' :
        setTimeout(() => {
          if(actives.length === 2){
            blindTitles[actives[actives.indexOf(dealerIndex)]] = 'Dealer / Small Blind';
            if(actives.indexOf(dealerIndex) === 0){
              blindTitles[actives[actives.length - 1]] = 'Big Blind';
            } else {
              blindTitles[actives[dealerIndex - 1]] = 'Big Blind';
            }
            round = 'preFlop';
          } else {
              blindTitles[actives[actives.indexOf(dealerIndex)]] = 'Dealer';
              let smallIndex = dealerIndex - 1;
              let bigIndex = dealerIndex - 2;
              if(smallIndex < 0){
                smallIndex += actives.length;
              }
              if(bigIndex < 0){
                bigIndex += actives.length;
              }
              blindTitles[actives[actives.indexOf(smallIndex)]] = 'Small Blind';
              blindTitles[actives[actives.indexOf(bigIndex)]] = 'Big Blind';
              round = 'preFlop';
          }
          this.setState({
            blindTitles: blindTitles,
            round: round,
            pause: true,
          });
        }, turnTime);
        break;

      case 'preFlop' : 
          id = setInterval(() => {
            const choices = this.state.turnChoices;
            let stopTheRound= true;
            choices.forEach((choice) => {
              if(choice !== 'Good' && choice !== 'Fold'){
                stopTheRound = false;
              }
            });
            if(stopTheRound){
              this.endBettingRound();
              clearInterval(id);
              board.push(this.createCards(this.dealCards(3)), false);
              this.setState({
                round: 'flop',
                pause: true,
              });
              return;
            }
            this.bet(turn);
            let flopTurnIndex = actives.indexOf(dealerIndex) - 1;
            if(flopTurnIndex < 0) {
              flopTurnIndex = actives[actives.length - 1];
            } else {
              flopTurnIndex = actives[actives.indexOf(dealerIndex - 1)];
            }
            turn = flopTurnIndex + 1;
          }, turnTime);
        break;

      case 'flop' :
        id = setInterval(() => {
          const choices = this.state.turnChoices;
          let stopTheRound = true;
          choices.forEach((choice) => {
            if(choice !== 'Good' && choice !== 'Fold'){
              stopTheRound = false;
            }
          });
          if(stopTheRound){
            this.endBettingRound();
            clearInterval(id);
            board.push(this.createCards(this.dealCards(1)), false);
            this.setState({
              round: 'turn',
              pause: true,
            });
            return;
          }
          this.bet(turn);
          turn = this.findNextTurn(turn);
        }, turnTime);
        break;

      case 'turn' :
        id = setInterval(() => {
          const choices = this.state.turnChoices;
          let stopTheRound = true;
          choices.forEach((choice) => {
            if(choice !== 'Good' && choice !== 'Fold'){
              stopTheRound = false;
            }
          });
          if(stopTheRound){
            this.endBettingRound();
            clearInterval(id);
            board.push(this.createCards(this.dealCards(1)), false);
            this.setState({
              round: 'river',
              pause: true,
            });
            return;
          }
          this.bet(turn);
          turn = this.findNextTurn(turn);
        }, turnTime);
        break;

      case 'river' :
        id = setInterval(() => {
          const choices = this.state.turnChoices;
          let stopTheRound = true;
          choices.forEach((choice) => {
            if(choice !== 'Good' && choice !== 'Fold'){
              stopTheRound = false;
            }
          });
          if(stopTheRound){
            this.endBettingRound();
            clearInterval(id);
            this.setState({
              round: null,
              pause: true,
            });
            return;
          }
          this.bet(turn);
          turn = this.findNextTurn(turn);
        }, turnTime);
        break;

      default :
      setTimeout(() => {
        this.endRound();
        let nextDealerIndex;
        if(actives.indexOf(dealerIndex) === actives.length - 1){
          nextDealerIndex = actives[0];
        } else {
          nextDealerIndex = actives[actives.indexOf(dealerIndex) + 1];
        }
        dealer = nextDealerIndex + 1;
        round = 'blinds';
        this.setState({
          round: round,
          dealer: dealer,
          //TODO set turn properly here
          turn: dealer,
        });
      }, turnTime);
      break;
    }
  }

  findNextTurn(turn){
    let turnIndex = turn - 1;
    (actives.indexOf(turnIndex) === 0) ? turnIndex = actives[actives.length - 1] : turnIndex = actives[actives.indexOf(turnIndex) - 1];
    return turnIndex + 1;
  }

  endBettingRound(){
    let choices = this.state.turnChoices;
    let bet = this.state.bet;
    let con = this.state.contributions;
    let last = this.state.lastBet;
    const players = this.props.players;
    let turn = this.state.turn;
    choices = Array(players).fill('Thinking');
    bet = 0;
    con = Array(players).fill(0);
    last = null;
    //TODO track UTG and set back to that player
    turn = 1;
    this.setState({
      turnChoices: choices,
      bet: bet,
      contributions: con,
      lastBet: last,
      turn: turn,
    });
  }

  endRound(){
    console.log('Round Over!');
  }

  render(){
    const showDeck = false;
    const board = this.state.board;
    const p1 = this.state.p1;
    const p2 = this.state.p2;
    const p3 = this.state.p3;
    const p4 = this.state.p4;
    const deck = this.state.deck;
    const moneyList = this.state.moneyList;
    const pot = this.state.pot;
    const ante = this.state.bet;
    const choices = this.state.turnChoices;
    const paused = this.state.pause;
    const blindTitles = this.state.blindTitles;
    return(
      <div>
        <div id='cardDisplay'>
          {paused ? <button id='startRoundButton' onClick={()=>{this.handleTurn()}}>Start Round</button> : null}
          <div id='board' className='cardHolder'>{board}</div>
          {showDeck ? <div id='deckDisplay' className='cardHolder'>{deck}</div> : null}
          <div id='pot'>Pot: {pot} Ante: {ante}</div>
          <div id='playersArea'>
              {p1 ? <Player player='1' hand={p1} money={moneyList[0]} choice={choices[0]} blindTitle={blindTitles[0]}/> : null}
              {p2 ? <Player player='2' hand={p2} money={moneyList[1]} choice={choices[1]} blindTitle={blindTitles[1]}/> : null}    
              {p3 ? <Player player='3' hand={p3} money={moneyList[2]} choice={choices[2]} blindTitle={blindTitles[2]}/> : null}
              {p4 ? <Player player='4' hand={p4} money={moneyList[3]} choice={choices[3]} blindTitle={blindTitles[3]}/> : null}        
          </div>
        </div>
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
      <div>
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
