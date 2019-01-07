import * as THREE from 'three';
import { useEffect, forwardRef } from 'react';
import { useThree } from '../ThreeJSManager/';
import useSpaceshipControl from './hooks/useSpaceshipControl';
import { setupSpaceship } from './Spaceship.three';


const Spaceship = (_, spaceshipDataRef) => {
  const rotation = useSpaceshipControl({ turnSpeed: 6 });
  const { getEntity, timer } = useThree(
    ({ scene }) => setupSpaceship(scene),
    ({ scene }, { group })  => {
      scene.remove(group);
    },
  );

  useEffect(
    () => {
      const { group } = getEntity();
      group.rotation.z = rotation;
    },
    [rotation],
  );

  useEffect(
    () => {
      const { line: { geometry, matrixWorld } } = getEntity();
      const _tipVector = geometry.vertices[0];
      const _centerVector = geometry.vertices[2];

      const tipVector = new THREE.Vector3().copy(_tipVector).applyMatrix4(matrixWorld);
      const centerVector = new THREE.Vector3().copy(_centerVector).applyMatrix4(matrixWorld);
      const directionVector = new THREE.Vector3(
        tipVector.x - centerVector.x,
        tipVector.y - centerVector.y,
        0,
      ).normalize();

      spaceshipDataRef.current = {
        directionVector,
        tipVector,
      }
    },
    [timer],
  );

  return null;
}

export default forwardRef(Spaceship);
