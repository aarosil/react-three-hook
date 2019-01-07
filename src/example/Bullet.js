import * as THREE from 'three';
import { useEffect } from 'react';
import { useThree } from '../ThreeJSManager/';

const Bullet = ({ startPoint, directionVector }) => {
  const { getEntity } = useThree(({ scene }) => {
    const material = new THREE.LineBasicMaterial({ color: 0xff00ff });
    const geometry = new THREE.Geometry();
    
    geometry.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0),
    );

    const line = new THREE.Line(geometry, material);
    line.position.x = startPoint.x
    line.position.y = startPoint.y
    line.rotation.z = Math.atan2(directionVector.y, directionVector.x);

    scene.add(line);

    return line;
  });

  useEffect(
    () => {
      const line = getEntity();
      line.position.x = startPoint.x
      line.position.y = startPoint.y
    },
    [
      startPoint.x, 
      startPoint.y
    ],
  );

  return null;
};

export default Bullet;
