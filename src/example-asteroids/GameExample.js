import React from 'react';
import SceneManager from '../ThreeJSManager';
import Spaceship from './Spaceship';
import Asteroid from './Asteroid';
import Laserbeam from './Laserbeam';
import useAsteroidsGame from './hooks/useAsteroidsGame';
import { getCamera, getRenderer, getScene } from './threeSetup';
import LaserStrengthMeter from './LaserStrengthMeter';

const GameContainer = () => (
  <div style={{ flexGrow: 1 }}>
    <SceneManager
      getCamera={getCamera}
      getRenderer={getRenderer}
      getScene={getScene}
    >
      <Game />
    </SceneManager>
  </div>
);

const Game = ({ asteroidCount = 3 }) => {
  const {
    laserbeams,
    asteroids,
    shootLaser,
    laserStrength,
    knobs,
  } = useAsteroidsGame({ asteroidCount });

  return (
    <>
      <Spaceship shootLaser={shootLaser} laserStrength={laserStrength} />
      {asteroids.map(props => (
        <Asteroid key={props.uuid} {...props} />
      ))}
      {laserbeams.map(props => (
        <Laserbeam key={props.uuid} {...props} />
      ))}
      {knobs}
      <LaserStrengthMeter laserStrength={laserStrength} />
    </>
  );
};

export default GameContainer;
