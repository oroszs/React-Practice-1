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

  render() {
    const gameStart = this.state.game;
    const p = this.state.players;
    return(
      <div>
        <div id='menu'>
          <button id='startButton' onClick={() => this.start()}>Start Game</button>
          <div id='pNumHolder'>
            <button className='pNum' onClick={() => this.less()}>&lt;</button>
            <span id='players'>{p} Players</span>
            <button className='pNum' onClick={() => this.more()}>&gt;</button>
          </div>
        </div>
        {gameStart ? <Game/> : null}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      currentDeck: this.createDeck(),
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

  dealCards(handSize){
    let hand = [];
    const deck = this.state.currentDeck;
    for(let x = 0; x < handSize; x++){
      let index = Math.floor(Math.random() * deck.length);
      let card = deck[index];
      deck.splice(index, 1);
      hand.push(card);
    }
    this.setState({
      currentDeck: deck,
    });
    return hand;
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
    const startingMoney = 500;
    const p1 = this.createCards(this.dealCards(2), false);
    const p2 = this.createCards(this.dealCards(2), false);
    const p3 = this.createCards(this.dealCards(2), false);
    const deck = this.createCards(this.state.currentDeck, true);
    this.setState({
      p1: p1,
      p2: p2,
      p3: p3,
      deck: deck,
      m1: startingMoney,
      m2: startingMoney,
      m3: startingMoney,
    });
  }

  render(){
    const board = this.state.board;
    const p1 = this.state.p1;
    const p2 = this.state.p2;
    const p3 = this.state.p3;
    const deck = this.state.deck;
    const m1 = this.state.m1;
    const m2 = this.state.m2;
    const m3 = this.state.m3;
    return(
      <div>
        <div id='cardDisplay'>
          <div id='board' className='cardHolder'>{board}</div>
          <div id='deckDisplay' className='cardHolder'>{deck}</div>
          <div id='playersArea'>
              <Player player='1' hand={p1} money={m1}/>
              <Player player='2' hand={p2} money={m2}/>    
              <Player player='3' hand={p3} money={m3}/>        
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
    const money = this. props.money;
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
