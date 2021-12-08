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
    el.value = val;
    this.setState({
      money: val,
    });
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

  componentDidMount(){
    let hands = [];
    const players = this.props.players;
    for(let i = 0; i < players; i++){
      hands.push(this.createCards(this.dealCards(2), false));
      console.log(hands[i]);
    }
    const board = this.createCards(this.dealCards(5), false);
    const deck = this.createCards(this.state.currentDeck, true);
    this.setState({
      p1: hands[0],
      p2: hands[1],
      p3: hands[2],
      p4: hands[3],
      deck: deck,
      board: board,
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
    return (
      <div className='playerArea'>
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
