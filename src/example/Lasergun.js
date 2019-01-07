import * as THREE from 'three';
import React, { useRef, useEffect, forwardRef } from 'react';
import { useThree } from '../ThreeJSManager';
import Bullet from './Bullet';

const SPACEBAR_KEY_CODE = 32;

const Lasergun = ({ shipData = {} }, bulletsRef) => {
  const _shipData = useRef(shipData);
  _shipData.current = shipData;  
  
  const { timer } = useThree();

  
  const createBullet = (shipData) => {
    const { tipVector, directionVector } = shipData;
    const startPoint = new THREE.Vector3().copy(tipVector);
    
    const bullet = {
      directionVector,
      startPoint,
      uuid: THREE.Math.generateUUID(),
    }

    return bullet;
  }

  const handleSpacebar = (event) => {
    if (event.keyCode === SPACEBAR_KEY_CODE) {
      bulletsRef.current.push(createBullet(_shipData.current));
    }
  }

  useEffect(
    () => {
      window.addEventListener('keydown', handleSpacebar);

      return () => {
        window.removeEventListener('keydown', handleSpacebar);
      };
    },
    [],
  );

  useEffect(
    () => {
      // TODO: filter bullets that are out of view
      bulletsRef.current = bulletsRef.current
        .map((bullet) => {
          bullet.startPoint = bullet.startPoint.add(bullet.directionVector);
          return bullet;
        })
    },
    [timer],
  );

  return bulletsRef.current.map(({uuid, ...props}) => {
    return (
      <Bullet key={uuid} {...props} />
    );
  });
}

export default forwardRef(Lasergun);
