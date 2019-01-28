import * as THREE from 'three';

const raycaster = new THREE.Raycaster();

export function coords(position, radius) {
  const { x, y, z } = position;
  const lat = Math.asin(y / radius) / (Math.PI / 180);
  const lon = -Math.atan2(z, x) / (Math.PI / 180);

  return [lat, lon];
}

export function vertex([longitude, latitude], radius) {
  const lambda = (longitude * Math.PI) / 180;
  const phi = (latitude * Math.PI) / 180;

  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.cos(lambda),
    radius * Math.sin(phi),
    -radius * Math.cos(phi) * Math.sin(lambda),
  );
}

export function wireframe(multilinestring, radius, material) {
  const geometry = new THREE.Geometry();

  for (const P of multilinestring.coordinates) {
    for (let p0, p1 = vertex(P[0], radius), i = 1; i < P.length; ++i) {
      geometry.vertices.push((p0 = p1), (p1 = vertex(P[i], radius)));
    }
  }

  return new THREE.LineSegments(geometry, material);
}

export function* range(start, stop, step) {
  for (let i = 0, v = start; v < stop; v = start + ++i * step) {
    yield v;
  }
}

export function parallel(y, x0, x1, dx = 2.5) {
  return Array.from(range(x0, x1 + 1e-6, dx), x => [x, y]);
}

export function meridian(x, y0, y1, dy = 2.5) {
  return Array.from(range(y0, y1 + 1e-6, dy), y => [x, y]);
}

export function graticule10() {
  return {
    type: 'MultiLineString',
    coordinates: [].concat(
      Array.from(range(-180, 180, 10), x =>
        x % 90 ? meridian(x, -80, 80) : meridian(x, -90, 90),
      ),
      Array.from(range(-80, 80 + 1e-6, 10), y => parallel(y, -180, 180)),
    ),
  };
}

// returns between -1 and 1 for X,Y over the canvas element
export function normalizedDeviceCoords(canvas, { clientX, clientY }) {
  const bbox = canvas.getBoundingClientRect();
  return {
    x: ((clientX - bbox.x) / bbox.width) * 2 - 1,
    y: -(((clientY - bbox.y) / bbox.height) * 2) + 1,
  };
}

export function canvasCoords(camera, canvas, vector) {
  const { offsetWidth, offsetHeight } = canvas;
  camera.updateMatrixWorld();
  const position = vector.clone();
  const { x, y } = position.project(camera);

  return {
    x: ((x + 1) * offsetWidth) / 2 + 1,
    y: ((-y + 1) * offsetHeight) / 2 + 1,
  };
}

// returns the point on the sphere the pointer is above
export function spherePositionAtDeviceCoords(sphere, camera, { x = 0, y = 0 }) {
  raycaster.setFromCamera({ x, y }, camera);
  const intersects = raycaster.intersectObject(sphere);

  if (intersects.length) return intersects[0].point;
}

export function getCameraAltitude(camera) {
  const { x, y, z } = camera.position;
  return Math.sqrt(x * x + y * y + z * z);
}

// focuses camera at a given point
export function pointCameraAtSpherePosition(camera, controls, point, altitude) {
  const { x, y, z } = point;
  const radius = Math.sqrt(x * x + y * y + z * z);
  const coeff = 1 + (altitude - radius) / radius;

  camera.position.copy(point.multiplyScalar(coeff));
  controls.update();
}
