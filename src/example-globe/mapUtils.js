import * as THREE from 'three';

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
