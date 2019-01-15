import React from 'react';
import SceneManager from '../ThreeJSManager';
import Spaceship from './Spaceship';
import Asteroid from './Asteroid';
import Laserbeam from './Laserbeam';
import useAsteroidsGame from './hooks/useAsteroidsGame';
import {
  getCamera,
  getRenderer,
  getScene,
} from './threeSetup';

const GameContainer = () =>
  <SceneManager
    getCamera={getCamera}
    getRenderer={getRenderer}
    getScene={getScene}
  >
    <Game />
  </SceneManager>

const Game = ({ asteroidCount = 3}) => {
  const { 
    laserbeams, 
    asteroids, 
    shootLaser,
  } = useAsteroidsGame({ asteroidCount });

  return (
    <>
      <Spaceship 
        shootLaser={shootLaser}
      />
      {
        asteroids.map(props => (
          <Asteroid
            key={props.uuid} 
            {...props}
          />
        ))
      }
      {
        laserbeams.map(props => (
          <Laserbeam
            key={props.uuid}
            {...props}
          />
        ))
      }
    </>
  );
}

export default GameContainer;
