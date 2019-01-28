import * as THREE from 'three';
import * as topojson from 'topojson';
import {
  graticule10,
  wireframe,
  spherePositionAtDeviceCoords,
  coords,
  normalizedDeviceCoords,
  vertex,
  getCameraAltitude,
  pointCameraAtSpherePosition,
} from './mapUtils';
import { useThree } from '../ThreeJSManager';
import React, { useEffect, useRef, useState } from 'react';
import Country from './Country';
import data from './countries.geo';
const topography = topojson.topology({ data });
const upPosition = new THREE.Vector2();

// maximium pixel distance between pointer down and pointerup
// that will be treated as a click instead of a drag
const MOVE_DISTANCE_CLICK_THRESHOLD = 2;

const GlobeContainer = ({
  radius = 100,
  mapCenter,
  setMapCenter,
  getCameraControls,
}) => {
  const [countries] = useState(
    () => topojson.feature(topography, topography.objects.data).features,
  );
  const shouldPropagateChanges = useRef(false);
  const positionRef = useRef(new THREE.Vector2(0, 0));
  const [center, setCenter] = useState(mapCenter);

  const { getEntity, canvas } = useThree(({ scene }) => {
    const sphereGeometry = new THREE.SphereGeometry(radius * 0.99, 128, 128);
    const sphereMaterialProperties = {
      color: 0x0d0208,
      opacity: 0.6,
      transparent: true,
    };
    const sphereMaterial = new THREE.MeshBasicMaterial(
      sphereMaterialProperties,
    );
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    const graticuleGeometry = graticule10();
    const graticule = wireframe(
      graticuleGeometry,
      radius,
      new THREE.LineBasicMaterial({ color: 0x003b00 }),
    );

    sphere.add(graticule);
    scene.add(sphere);

    return sphere;
  });

  // on pointer move center map at point on middle of globe
  const handlePointerMove = useRef(() => {
    const { camera } = getCameraControls();
    const sphere = getEntity();
    const spherePosition = spherePositionAtDeviceCoords(sphere, camera, {
      x: 0,
      y: 0,
    });
    const [lat, lon] = coords(spherePosition, radius);
    setMapCenter([lat, lon]);
  });

  // on pointer up
  const handlePointerUp = useRef(({ clientX, clientY }) => {
    upPosition.set(clientX, clientY);

    // check distance from pointer down
    const moveDistance = positionRef.current.distanceTo(upPosition);
    const isClick = moveDistance < MOVE_DISTANCE_CLICK_THRESHOLD;

    // center globe if distance counts as a click
    if (isClick) {
      const { camera } = getCameraControls();
      const sphere = getEntity();
      const deviceCoords = normalizedDeviceCoords(canvas, {
        clientX,
        clientY,
      });
      const spherePosition = spherePositionAtDeviceCoords(
        sphere,
        camera,
        deviceCoords,
      );

      if (spherePosition) {
        const globeCoords = coords(spherePosition, radius);
        setMapCenter(globeCoords);
      }
    }

    shouldPropagateChanges.current = false;
    canvas.removeEventListener('pointermove', handlePointerMove.current);
    canvas.removeEventListener('pointerup', handlePointerUp.current);
  });

  // on pointer down
  const onPointerDown = useRef(({ clientX, clientY }) => {
    shouldPropagateChanges.current = true;
    // store down position
    positionRef.current.set(clientX, clientY);

    // add event listeners
    canvas.addEventListener('pointermove', handlePointerMove.current);
    canvas.addEventListener('pointerup', handlePointerUp.current);
  });

  // set on pointer down event handlers when canvas updates
  useEffect(
    () => {
      if (!canvas) return;
      canvas.addEventListener('pointerdown', onPointerDown.current);

      return () => {
        canvas.removeEventListener('pointerdown', onPointerDown.current);
      };
    },
    [canvas],
  );

  useEffect(
    () => {
      if (!shouldPropagateChanges.current) {
        const { camera, controls } = getCameraControls();
        const position = vertex([mapCenter[1], mapCenter[0]], radius);
        const altitude = getCameraAltitude(camera);
        pointCameraAtSpherePosition(camera, controls, position, altitude);
      }
      setCenter(mapCenter);
    },
    [mapCenter],
  );

  return countries
    .reverse()
    .map((country, index) => (
      <Country
        mapCenter={center}
        getCameraControls={getCameraControls}
        key={index}
        highlight={!(index % 25)}
        data={country}
        radius={radius}
      />
    ));
};

export default GlobeContainer;
