import * as THREE from 'three';
import { useEffect } from 'react';
import { useThree } from '../ThreeJSManager';

const Laserbeam = ({ position, direction }) => {
  const { getEntity } = useThree(({ scene }) => {
    const material = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    const geometry = new THREE.Geometry();
    
    geometry.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0),
    );

    const line = new THREE.Line(geometry, material);
    line.position.x = position.x
    line.position.y = position.y
    line.rotation.z = Math.atan2(direction.y, direction.x);

    scene.add(line);

    return line;
  });

  useEffect(
    () => {
      const line = getEntity();
      line.position.x = position.x
      line.position.y = position.y
    },
    [
      position.x, 
      position.y
    ],
  );

  return null;
};

export default Laserbeam;
