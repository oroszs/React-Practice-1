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
    this.dealHand = this.dealHand.bind(this);
  }

  createDeck(){
    const faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
    const suits = ['\u2660', '\u2663', '\u2665', '\u2666'];
    const fullDeck = [];
    suits.forEach(suit => {
      faces.forEach(face => {
        fullDeck.push(`${face} ${suit}`);
      });
    });
    return fullDeck;
  }

  dealHand(handSize){
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

  componentDidMount(){
    const deck = this.state.currentDeck;
    const thisHand = this.createCards(this.dealHand(5));
    const thisDeck = this.createCards(deck);

    this.setState({
      dispHand: thisHand,
      dispDeck: thisDeck,
    });
  }

  createCards(c){
    let cards = [];
    for(let x = 0; x < c.length; x++){
      cards.push(
        <div className='card' key={c[x]}>
          {c[x].includes('\u2665') || c[x].includes('\u2666') ?
          <div className='cardText'>{c[x].split(' ')[0]} <span style={{color: 'red'}}>{c[x].split(' ')[1]}</span></div> :
          <div className='cardText'>{c[x]}</div>}
        </div>
      );
    }
    return cards;
  }

  render(){
    return(
      <div>
        <div id='cardDisplay'>
          {this.state.dispDeck}
          <div id='playerArea'>
            {this.state.dispHand}
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
