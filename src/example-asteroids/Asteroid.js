import * as THREE from 'three';
import { useEffect } from 'react';
import { useThree } from '../ThreeJSManager';

const ASTEROID_SEGMENTS = 16;

const Asteroid = ({ position, rotation, radius, uuid }) => {
  const { getEntity } = useThree(
    ({ scene }) => {
      const material = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
      const geometry = new THREE.Geometry();

      for (let i = 0; i <= ASTEROID_SEGMENTS; i++) {
        const vertex = new THREE.Vector3()
        const randomX = Math.random() * (radius/2) - (radius/2);
        const randomY = Math.random() * (radius/2) - (radius/2);
    
        vertex.set(
          radius * Math.sin(i * 2*Math.PI / ASTEROID_SEGMENTS) + randomX,
          radius * Math.cos(i * 2*Math.PI / ASTEROID_SEGMENTS) + randomY,
          0,
        );
    
        if (i === ASTEROID_SEGMENTS) {
          geometry.vertices.push(geometry.vertices[0]);
        } else {
          geometry.vertices.push(vertex);
        }
      };

      const asteroid = new THREE.Line(geometry, material);
      asteroid.userData.gameUuid = uuid;
      asteroid.userData.isAsteroid = true;
      scene.add(asteroid);
      
      return asteroid;
    }
  );

    useEffect(
      () => {
        const asteroid = getEntity();
        asteroid.position.x = position.x;
        asteroid.position.y = position.y;
        asteroid.rotation.z = rotation.z;
      },
      [
        position.x,
        position.y,
        rotation.z,
      ]
    );

  return null;
}

export default Asteroid;
