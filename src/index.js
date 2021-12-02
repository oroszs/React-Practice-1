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
    const suits = ['Spades', 'Clubs', 'Diamonds', 'Hearts'];
    const fullDeck = [];
    suits.forEach(suit => {
      faces.forEach(face => {
        fullDeck.push(`${face} of ${suit}, `);
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
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div id='cardDisplay'>
        {this.props.deck}
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
