import React, { useState } from 'react';
import SceneManager from './ThreeJSManager';
import Cube from './example/Cube';
import Grid from './example/Grid';
import CameraControls from './example/CameraControls';
import {
  getCamera,
  getRenderer,
  getScene,
} from './example/threeSetup';

function App() {
  const [color, changeColor] = useState('0000ff');
  const [showGrid, toggleShowGrid] = useState(true);
  const [showCube, toggleShowCube] = useState(true);

  return (
    <>
      <SceneManager
        getCamera={getCamera}
        getRenderer={getRenderer}
        getScene={getScene}
      >
        {
          showGrid &&
          <Grid />
        }
        {
          showCube &&
            <Cube
              color={Number(`0x${color}`)}
            />
          }
        <CameraControls />
      </SceneManager>

      <div
        style={{
          width: '100px',
          padding: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <input
            type='text'
            placeholder='enter a hex color'
            onChange={(e) =>
              changeColor(e.target.value)
            }
          />

          <label>
            <input
              type='checkbox'
              checked={showGrid}
              onChange={() => toggleShowGrid(!showGrid)}
            />
            show grid
          </label>

          <label>
            <input
              type='checkbox'
              checked={showCube}
              onChange={() => toggleShowCube(!showCube)}
            />
            show cube
          </label>
        </div>
      </div>
    </>
  );
}

export default App;
