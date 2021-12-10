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
      players: 2,
      money: 500,
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
  }

  more() {
    let p = this.state.players;
    if(p < 4){
      p ++;
    }
    this.setState({
      players: p,
    });
  }

  getVal(){
    let el = document.getElementById('moneySlider');
    let val = el.value;
    this.setState({
      money: val,
    });
  }

  componentDidMount(){
    let el = document.getElementById('moneySlider');
    el.value = this.state.money;
  }

  render() {
    const gameStart = this.state.game;
    const p = this.state.players;
    let val = this.state.money;
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
        {gameStart ? <Game players={p} money={val}/> : null}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      currentDeck: this.createDeck(),
      board: [],
      round: 'preFlop',
      turn: 1,
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
        <div className='cardContainer' >
          <div className={deck ? 'deckCard' : 'card'} key={cards[x]} >
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
    const raiseTimes = 5;
    const raiseMult = maxMoney / 10;
    let turnIndex = playerTurn - 1;
    const player = this.state.playerList[turnIndex];
    let moneyList = this.state.moneyList.slice();
    let money = moneyList[turnIndex];
    let turnChoice;
    let turnChoices = this.state.turnChoices.slice();
    let currentBet = this.state.bet;
    let pot = this.state.pot;
    if(player === 'cpu'){
      let choice = Math.floor(Math.random * 2);
      switch (choice) {
        case 0:
          //Check / Call
          if(currentBet === 0){
            turnChoice = 'Check';
          }
          if(money < currentBet){
            pot += money;
            turnChoice = 'All In';
          } else {
            pot += currentBet;
            money -= currentBet;
            turnChoice = 'Call';
          }
          break;
        case 1:
          //Raise
          let amt = Math.floor(Math.random() * raiseTimes) * raiseMult;
          if(amt > money){
            pot += money;
            money = 0;
            turnChoice = 'All In';
          } else {
            pot += amt;
            money -= amt;
            turnChoice = 'Raise';
          }
          break;
        case 2:
          //Fold
          turnChoice = 'Fold';
          break;
        default:
          break;
      }
      moneyList[turnIndex] = money;
      turnChoices[turnIndex] = turnChoice;
      this.setState({
        playerList: playerList,
        moneyList: moneyList,
        turnChoices: turnChoices,
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

  componentDidUpdate(){
    this.handleTurn();
  }

  handleTurn(){
    let board = this.state.board;
    let turn = this.state.turn;
    let players = this.state.players;
    let round = this.state.round;
    if(turn < players) {
      turn ++;
    } else {
      turn = 1;
    }
    switch (round) {
      case 'preFlop' :
        this.bet(turn);
        round = 'flop';
        break;
      case 'flop' :
        board.push(this.createCards(this.dealCards(3), false));
        this.bet(turn);
        round = 'river';
        break;
      case 'river' :
        board.push(this.createCards(this.dealCards(1), false));
        this.bet(turn);
        round = 'turn';
        break;
      case 'turn' :
        board.push(this.createCards(this.dealCards(1), false));
        this.bet(turn);
        round = null;
        break;
      default :
        this.endRound();
        round = 'preFlop';
      break;
    }
    this.setState({
      board: board,
      round: round,
    });
  }

  render(){
    const board = this.state.board;
    const p1 = this.state.p1;
    const p2 = this.state.p2;
    const p3 = this.state.p3;
    const p4 = this.state.p4;
    const deck = this.state.deck;
    return(
      <div>
        <div id='cardDisplay'>
          <div id='board' className='cardHolder'>{board}</div>
          <div id='deckDisplay' className='cardHolder'>{deck}</div>
          <div id='playersArea'>
              {p1 ? <Player player='1' hand={p1} money={this.props.money}/> : null}
              {p2 ? <Player player='2' hand={p2} money={this.props.money}/> : null}    
              {p3 ? <Player player='3' hand={p3} money={this.props.money}/> : null}
              {p4 ? <Player player='4' hand={p4} money={this.props.money}/> : null}        
          </div>
        </div>
      </div>
    );
  }
}

class Player extends React.Component {
  constructor (props){
    super (props);
  }

  render(){
    const player = this.props.player;
    const hand = this.props.hand;
    const money = this.props.money;
    const title = this.props.title;
    return (
      <div className='playerArea'>
        <span>{title ? title : null}</span>
        <span>Player {player}</span>
        <div className='playerInfo'>{money}</div>
        <div className='cardHolder'>{hand}</div>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
