import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class App extends React.Component {

  createDeck(){
    const faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
    const suits = ['\u2660', '\u2663', '\u2665', '\u2666'];
    const fullDeck = [];
    suits.forEach(suit => {
      faces.forEach(face => {
        (suit === '\u2665' || suit === '\u2666') ?
        fullDeck.push(<span>{face} <span className='redSuit'>{suit}</span></span>) :
        fullDeck.push(`${face} ${suit}`);
      });
    });
    return this.createCards(fullDeck);
  }

  createCards(deck){
    let cards = [];
    deck.forEach(card => {
      cards.push(
        <div className='card' key={card}>
          <div className='cardText'>{card}</div>
        </div>
      );
    });
    return cards;
  }

  render() {
    return(
      <div id='wrapper'>
        <Game createDeck={this.createDeck()}/>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      currentDeck: this.props.createDeck,
    }
    this.dealHand = this.dealHand.bind(this);
  }

  showCards(){
    return this.state.currentDeck;
  }

  dealHand(handSize){
    let hand = [];
    const deck = this.state.currentDeck;
    console.log(deck.length);
    for(let x = 0; x < handSize; x++){
      let index = Math.random() * deck.length;
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
    this.setState({
      hands: this.dealHand(5),
    });
  }

  render(){
    const hands = this.state.hands;
    return(
      <div>
        <div id='cardDisplay'>
          {this.showCards()}
        </div>
        <div id='playerArea'>
          <Player hand={hands} />
        </div>
      </div>
    );
  }
}

class Player extends React.Component {
  constructor(props){
    super(props);
  }

  showHand(){
    return this.props.hand;
  }

  render(){
    return(
      <>{this.showHand()}</>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
