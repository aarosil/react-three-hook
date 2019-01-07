import React from 'react';
import ThreeJSManager from './ThreeJSManager';
import Grid from './example/Grid';
import GameContainer from './example/GameContainer';

import {
  getCamera,
  getRenderer,
  getScene,
} from './example/threeSetup';

function App() {
  return (
    <>
      <ThreeJSManager
        getCamera={getCamera}
        getRenderer={getRenderer}
        getScene={getScene}
      >
        <Grid />
        <GameContainer />
      </ThreeJSManager>

    </>
  );
}

export default App;
