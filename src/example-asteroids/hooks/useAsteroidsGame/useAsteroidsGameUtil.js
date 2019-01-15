import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
raycaster.far = 0.1

const DEFAULT_ASTEROID_RADIUS = 12;

export const proceedGame = ({ laserbeams, asteroids, scene, boundingBox }) => {
  const newAsteroids = [];
  const newLaserbeams = [];
  const asteroidsMap = asteroids.reduce((memo, asteroid) => {
    memo[asteroid.uuid] = asteroid;
    return memo;
  }, {});

  laserbeams.forEach(laserbeam => {
    let hit = false;
    raycaster.set(laserbeam.position, laserbeam.direction);
    const intersections = raycaster.intersectObjects(scene.children);

    if (intersections.length) {
      const hitAsteroid = intersections.find(({ object: { userData }}) => userData.isAsteroid);
      const gameAsteroid = hitAsteroid && asteroidsMap[hitAsteroid.object.userData.gameUuid];

      if (gameAsteroid) {
        delete asteroidsMap[gameAsteroid.uuid];
        hit = true;
        if (gameAsteroid.radius > 1) {
          newAsteroids.push(...divideAsteroid(gameAsteroid, boundingBox));
        }
      }
    }

    laserbeam.position.add(laserbeam.direction);
    if (!hit && boundingBox.containsPoint(laserbeam.position)) {
      newLaserbeams.push(laserbeam);
    }
  })

  const movedAsteroids = advanceAsteroids(boundingBox, Object.values(asteroidsMap));

  return {
    asteroids: newAsteroids.concat(movedAsteroids),
    laserbeams: newLaserbeams,
  }
}

const divideAsteroid = ({ position, radius }, box) =>
  Array(4)
    .fill()
    .map(() => ({
      ...createAsteroidGeometry({ radius: radius/2, box }),
      position: position.clone(),
    }))

const createAsteroidGeometry = ({ box, radius = DEFAULT_ASTEROID_RADIUS }) => {
  const xRange = box.max.x - box.min.x;
  const yRange = box.max.y - box.min.y;

  const direction = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    0,
  );

  const position = new THREE.Vector3(
    Math.random() * xRange - xRange/2,
    Math.random() * yRange - yRange/2,
    0,
  );

  return {
    position,
    rotation: new THREE.Vector3(),
    radius,
    direction,
    uuid: THREE.Math.generateUUID(),
  };
}

export const setupAsteroids = (count, box) => 
  Array(count)
    .fill()
    .map(() => createAsteroidGeometry({ box }));

const advanceAsteroids = (box, asteroids) =>
  asteroids.map(asteroid => {
    asteroid.rotation.z += asteroid.radius * 1/10 * Math.PI/180;
    asteroid.position.add(asteroid.direction)
    if (!box.containsPoint(asteroid.position)) {
      if (asteroid.position.x > box.max.x) asteroid.position.x = box.min.x;
      if (asteroid.position.x < box.min.x) asteroid.position.x = box.max.x;
      if (asteroid.position.y > box.max.y) asteroid.position.y = box.min.y;
      if (asteroid.position.y < box.min.y) asteroid.position.y = box.max.y;
    }
    return asteroid;
  });

export const generateLaserbeam = ({ position, direction }) => ({
  direction,
  position: position,
  uuid: THREE.Math.generateUUID(),
});

export const makeBoundingBoxFromCamera = camera => {
  const { top, left, bottom, right } = camera;

  return new THREE.Box3(
    new THREE.Vector3(left, bottom, 0),
    new THREE.Vector3(right, top, 0),
  );
}