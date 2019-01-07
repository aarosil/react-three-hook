import { useEffect } from 'react';
import { useThree } from '../ThreeJSManager/';
import {
  checkCollisions,
  rotateAsteroids,
  setupAsteroids,
} from './Asteroids.three';

const Asteroids = ({ count = 100, bullets, reportScore }) => {
  const { timer, getEntity } = useThree(
    ({ scene }) => setupAsteroids(scene, count),
  );

  useEffect(
    () => {
      const asteroids = getEntity();
      rotateAsteroids(asteroids);
      checkCollisions(bullets, asteroids)
    },
    [timer],
  );

  return null;
}

export default Asteroids;
