import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class App extends React.Component {

  render() {
    return(
      <div id='wrapper'>
        <Game />
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
    const board = this.createCards(this.dealCards(5), false);
    const p1 = this.createCards(this.dealCards(2), false);
    const p2 = this.createCards(this.dealCards(2), false);
    const p3 = this.createCards(this.dealCards(2), false);
    const deck = this.createCards(this.state.currentDeck, true);
    this.setState({
      board: board,
      p1: p1,
      p2: p2,
      p3: p3,
      deck: deck,
    });
  }

  render(){
    const board = this.state.board;
    const p1 = this.state.p1;
    const p2 = this.state.p2;
    const p3 = this.state.p3;
    const deck = this.state.deck;
    return(
      <div>
        <div id='cardDisplay'>
          <div id='board' className='cardHolder'>{board}</div>
          <div id='deckDisplay' className='cardHolder'>{deck}</div>
          <div id='playersArea'>
            <div className='playerArea cardHolder' key='player1'>{p1}</div>
            <div className='playerArea cardHolder' key='player2'>{p2}</div>
            <div className='playerArea cardHolder' key='player3'>{p3}</div>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
