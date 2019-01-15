import React from 'react';
import {
  BrowserRouter as Router,
  Route, 
  Link,
} from "react-router-dom";
import CubeExample from './example-cube/CubeExample';
import GameContainer from './example-asteroids/GameContainer';

const App = () =>
  <Router basename={process.env.PUBLIC_URL}>
    <>
      <Route
        exact 
        path='/' 
        render={() => 
          <div className='foo'>
            <h2>Examples:</h2>
            <div><Link to='/cube'>Cube</Link></div>
            <div><Link to='/asteroids'>Asteroids</Link></div>
          </div>
        }
        />
      <Route
        path="/cube" 
        component={CubeExample} 
        />
      <Route
        path="/asteroids"
        component={GameContainer} 
        />
    </>
  </Router>

export default App;
