import React, { useRef } from 'react';
import Spaceship from './Spaceship';
import Lasergun from './Lasergun';
import Asteroids from './Asteroids';
import { useThree } from '../ThreeJSManager';

const GameContainer = () => {
  useThree();
  const shipDataRef = useRef();
  const bulletsRef = useRef([]);

  return (
    <>
      <Spaceship 
        ref={shipDataRef}
      />
      <Lasergun 
        shipData={shipDataRef.current} 
        ref={bulletsRef}
      />
      <Asteroids 
        bullets={bulletsRef.current}
      />
    </>
  );
}

export default GameContainer;
