import * as THREE from 'three';
import * as topojson from 'topojson';
import { vertex, wireframe, canvasCoords } from './mapUtils';
import { useThree } from '../ThreeJSManager';
import React, { useState, useEffect, useRef } from 'react';

function screenXY(camera, position, canvas) {
  var vector = position.clone();
  var widthHalf = canvas.width / 2;
  var heightHalf = canvas.height / 2;

  vector.project(camera);

  vector.x = vector.x * widthHalf + widthHalf;
  vector.y = vector.y * heightHalf + heightHalf;
  vector.z = 0;

  return vector;
}

const svgStyle = {
  position: 'absolute',
  top: '0px',
  left: '0px',
  height: '100%',
  width: '100%',
  color: '#ff00ff',
};

const DISTANCE_FROM_CAMERA = 1;

const Country = ({ data, radius, highlight, mapCenter }) => {
  const [coordinates, setCoordinates] = useState([]);
  const planeRef = useRef(null);

  const { camera, scene, canvas } = useThree(({ scene }) => {
    const topography = topojson.topology({ data });
    setCoordinates(topography.arcs);

    const landMesh = topojson.mesh(topography, topography.objects.data);
    const land = wireframe(
      landMesh,
      radius,
      new THREE.LineBasicMaterial({ color: 0x008f11 }),
    );

    scene.add(land);

    return land;
  });

  const setPlaneFromCamera = (plane, camera) => {
    plane.quaternion.copy(camera.quaternion);
    const vector = camera.getWorldDirection(new THREE.Vector3());
    const { x, y, z } = camera.position;
    const cameraDistance = Math.sqrt(x * x + y * y + z * z);
    const distanceFromOrigin = cameraDistance - DISTANCE_FROM_CAMERA;
    vector.negate().multiplyScalar(distanceFromOrigin);
    plane.position.set(vector.x, vector.y, vector.z);
  };

  useEffect(
    () => {
      if (highlight && coordinates) {
        const vFOV = THREE.Math.degToRad(camera.fov); // convert vertical fov to radians
        const height = 2 * Math.tan(vFOV / 2) * DISTANCE_FROM_CAMERA; // visible height
        const width = height * camera.aspect; // visible width
        const planegeometry = new THREE.PlaneGeometry(width, height);
        const planematerial = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
        });
        const plane = new THREE.Mesh(planegeometry, planematerial);
        var material = new THREE.MeshBasicMaterial({
          color: 0x00ff41,
          transparent: true,
          opacity: 0.6,
        });

        const updated = coordinates
          .map(group => group.map(coord => vertex(coord, radius)))
          .map(group => group.map(coord => screenXY(camera, coord, canvas)));

        const scale = width / canvas.width;
        const shapes = updated.map(group => {
          var path = new THREE.Shape();
          path.moveTo(group[0].x * scale, group[0].y * scale);
          group.forEach((coord, index, array) => {
            if (index === 0) return;
            const { x, y } = coord;
            const next = array[(index + 1) % array.length];
            path.moveTo(x * scale, y * scale);
            path.lineTo(next.x * scale, next.y * scale);
          });

          var geometry = new THREE.ShapeGeometry(path);
          var mesh = new THREE.Mesh(geometry, material);
          mesh.position.x -= width / 2;
          mesh.position.y -= height / 2;
          return mesh;
        });

        plane.add(...shapes);
        setPlaneFromCamera(plane, camera);
        scene.add(plane);

        planeRef.current = plane;

        return () => {
          scene.remove(plane);
          planeRef.current = null;
        };
      }
    },
    [
      mapCenter,
      coordinates,
      camera.position.x,
      camera.position.y,
      camera.position.z,
    ],
  );

  return null;
};

export default Country;
