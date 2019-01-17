import * as THREE from 'three';
import { useEffect } from 'react';
import { useThree } from '../ThreeJSManager/';
import useSpaceshipControl from './hooks/useSpaceshipControl';

const SPACEBAR_KEY_CODE = 32;

const Spaceship = ({ shootLaser }) => {
  const { getEntity } = useThree(
    ({ scene }) => {
      const material = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
      const geometry = new THREE.Geometry();
      const spaceshipGroup = new THREE.Group();
      
      geometry.vertices.push(
        new THREE.Vector3(0, 10, 0),
        new THREE.Vector3(-5, 0, 0),
        new THREE.Vector3(0, 2.5, 0),
        new THREE.Vector3(5, 0, 0),
        new THREE.Vector3(0, 10, 0),
      );
        
      const spaceship = new THREE.Line( geometry, material );
      const box = new THREE.Box3().setFromObject(spaceship);
    
      box.getCenter(spaceship.position);
      spaceship.position.multiplyScalar(-1);
      spaceshipGroup.position.y = -50
      spaceshipGroup.add(spaceship);
      scene.add(spaceshipGroup);
    
      return {
        spaceshipGroup,
        spaceship,
      };
    },
    ({ scene }, { spaceshipGroup })  => scene.remove(spaceshipGroup),
  );

  const handleSpacebar = (event) => {
    if (event.keyCode !== SPACEBAR_KEY_CODE) return;

    const { spaceship: { geometry, matrixWorld } } = getEntity();
    const position = geometry.vertices[0];
    const center = geometry.vertices[2];
  
    const worldPosition = new THREE.Vector3().copy(position).applyMatrix4(matrixWorld);
    const worldCenter = new THREE.Vector3().copy(center).applyMatrix4(matrixWorld);
    const direction = new THREE.Vector3(
      worldPosition.x - worldCenter.x,
      worldPosition.y - worldCenter.y,
      0,
    ).normalize();

    shootLaser(worldPosition, direction);
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
  
  const rotation = useSpaceshipControl({ turnSpeed: 6 });

  useEffect(
    () => {
      const { spaceshipGroup } = getEntity();
      spaceshipGroup.rotation.z = rotation;
    },
    [rotation],
  );
  
  return null;
}

export default Spaceship;
