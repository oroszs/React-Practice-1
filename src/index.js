import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      fullDeck: this.createDeck(),
    }
  }

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
    return fullDeck;
  }

  render() {
    return(
      <div id='wrapper'>
        <Game deck={this.state.fullDeck}/>
      </div>
    );
  }
}

class Game extends React.Component {

  createCards(){
    let cards = [];
    this.props.deck.forEach(card => {
      cards.push(
        <div className='card' key={card}>
          <div className='cardText'>{card}</div>
        </div>
      );
    });
    return cards;
  }

  render(){
    return(
      <div id='cardDisplay'>
        {this.createCards()}
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
