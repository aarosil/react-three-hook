import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import CubeExample from './example-cube/CubeExample';
import GameExample from './example-asteroids/GameExample';
import MapExample from './example-globe/MapExample';

const App = () => (
  <Router basename={process.env.PUBLIC_URL}>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Route
        exact
        path="/"
        render={() => (
          <div>
            <h2>Examples:</h2>
            <div>
              <Link to="/cube">Cube</Link>
            </div>
            <div>
              <Link to="/asteroids">Asteroids</Link>
            </div>
            <div>
              <Link to="/world-map">World Map</Link>
            </div>
          </div>
        )}
      />
      <Route path="/cube" component={CubeExample} />
      <Route path="/asteroids" component={GameExample} />
      <Route path="/world-map" component={MapExample} />
    </div>
  </Router>
);

export default App;
