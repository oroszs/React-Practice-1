import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      date: new Date(),
    }
  }

  render() {
    const day = days[this.state.date.getDay()];
    return(
      <div id='wrapper'>
        <h1>Hello World!</h1>
        <p>It's {day}</p>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
