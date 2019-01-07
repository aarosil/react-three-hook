import * as THREE from 'three';

const DEFAULT_ASTEROID_RADIUS = 12;
const DEFAULT_ASTERIOD_SEGMENTS = 16;

const raycaster = new THREE.Raycaster();
raycaster.far = 0.1

export const checkCollisions = (bullets, asteroids) =>
  asteroids.children.forEach(asteroid =>
    bullets
      .filter(({ dead }) => !dead)
      .forEach(bullet => {
        raycaster.set(bullet.startPoint, bullet.directionVector);
        const intersections = raycaster.intersectObject(asteroid);
        if (intersections.length) {
          handleCollision(intersections[0]);
          bullet.dead = true;
        }
      }));

export const createAsteroidGeometry = (radius = DEFAULT_ASTEROID_RADIUS, segments = DEFAULT_ASTERIOD_SEGMENTS) => {
  const material = new THREE.LineBasicMaterial({ color: 0x0 });
  const geometry = new THREE.Geometry();
  
  for (let i = 0; i <= segments; i++) {
    const vertex = new THREE.Vector3()
    const randomX = Math.random() * (radius/2) - (radius/2);
    const randomY = Math.random() * (radius/2) - (radius/2);

    vertex.set(
      radius * Math.sin(i * 2*Math.PI / segments) + randomX,
      radius * Math.cos(i * 2*Math.PI / segments) + randomY,
      0,
    );

    if (i === segments) {
      geometry.vertices.push(geometry.vertices[0]);
    } else {
      geometry.vertices.push(vertex);
    }
  };

  const asteroid = new THREE.Line(geometry, material);
  asteroid.userData.radius = radius;
  asteroid.userData.directionVector = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    0,
  );

  return asteroid;
}

export const setupAsteroids = (scene, count) => {
  const asteroids = new THREE.Group();
    
  for (let i = 0; i < count; i++) {
    const asteroid = createAsteroidGeometry();
    asteroids.add(asteroid);
  }

  scene.add(asteroids);
  return asteroids;
}

const handleCollision = (hit) => {
  const { object } = hit;

  const { userData: { radius } } = object;
  const asteroids = object.parent;
  if (object) asteroids.remove(object);

  if (radius >= 1) {
    for (let i = 0; i < 4; i++) {
      const piece = createAsteroidGeometry(radius/2);
      piece.position.copy(object.position);
      asteroids.add(piece);
    }
  }
  
};

export const rotateAsteroids = (asteroids) => {
  asteroids.children.forEach(asteroid => {
    asteroid.rotation.z += asteroid.userData.radius * 1/10 * Math.PI/180;
    asteroid.position.add(asteroid.userData.directionVector)
  });
}
