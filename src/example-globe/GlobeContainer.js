import * as THREE from 'three';
import * as topojson from 'topojson';
import * as mapUtils from './mapUtils';
import { useThree } from '../ThreeJSManager';
import { useEffect, useRef } from 'react';

var raycaster = new THREE.Raycaster();
const upPosition = new THREE.Vector2();

// maximium pixel distance between pointer down and pointerup
// that will be treated as a click instead of a drag
const MOVE_DISTANCE_CLICK_THRESHOLD = 2;

const GlobeContainer = ({ mapData, radius = 100, mapCenter, setMapCenter, getCameraControls }) => {
  const canvasRef = useRef();
  const shouldPropagateChanges = useRef(false);
  const positionRef = useRef(new THREE.Vector2(0,0));

  const { getEntity } = useThree(({ scene, canvas }) => {
    canvasRef.current = canvas;
    const landMesh = topojson.mesh(mapData, mapData.objects.countries);
    const land = mapUtils.wireframe(
      landMesh,
      radius,
      new THREE.LineBasicMaterial({ color: 0x00ff41 }),
    );

    const landGeometry = new THREE.SphereGeometry(radius * 0.99, 128, 128);
    const landMaterialProperties = {
      color: 0x0d0208,
      opacity: 0.6,
      transparent: true,
    };
    const landMaterial = new THREE.MeshBasicMaterial(landMaterialProperties);
    const sphere = new THREE.Mesh(landGeometry, landMaterial);

    const graticuleGeometry = mapUtils.graticule10();
    const graticule = mapUtils.wireframe(
      graticuleGeometry,
      radius,
      new THREE.LineBasicMaterial({ color: 0x003b00 }),
    );

    scene.add(land);
    scene.add(graticule);
    scene.add(sphere);

    return sphere;
  });

  // returns between -1 and 1 for X,Y over the canvas element
  const normalizedDeviceCoords = ({ clientX, clientY }) => {
    const bbox = canvasRef.current.getBoundingClientRect();
    return {
      x: ((clientX - bbox.x) / bbox.width) * 2 - 1,
      y: -(((clientY - bbox.y) / bbox.height) * 2) + 1,
    };
  };

  // returns the point on the sphere the pointer is above
  const spherePositionAtDeviceCoords = ({ x = 0, y = 0 }) => {
    const { camera } = getCameraControls();
    raycaster.setFromCamera({ x, y }, camera);
    const raycastObject = getEntity();
    const intersects = raycaster.intersectObject(raycastObject);

    if (intersects.length) return intersects[0].point;
  };

  const getCameraAltitude = () => {
    const { camera } = getCameraControls();
    const { x, y, z, } = camera.position;
    return Math.sqrt(x * x + y * y + z * z);
  }

  // focuses camera at a given point
  const pointCameraAtSpherePosition = (point, altitude) => {
    const { controls, camera } = getCameraControls();
    const { x, y, z } = point;
    const radius = Math.sqrt(x * x + y * y + z * z);
    const coeff = 1 + (altitude-radius) / radius;

    camera.position.copy(point.multiplyScalar(coeff));
    controls.update();
  };

  // on pointer move center map at point on middle of globe
  const handlePointerMove = useRef(() => {
    const spherePosition = spherePositionAtDeviceCoords({ x: 0, y: 0 });
    const [lat, lon] = mapUtils.coords(spherePosition, radius);
    setMapCenter([lat, lon]);
  });

  // on pointer up
  const handlePointerUp = useRef(({ clientX, clientY }) => {
    upPosition.set(clientX, clientY);

    // check distance from pointer down
    const moveDistance = positionRef.current.distanceTo(upPosition);
    const isClick = moveDistance < MOVE_DISTANCE_CLICK_THRESHOLD;

    // center globe if event counts as a click
    if (isClick) {
      const deviceCoords = normalizedDeviceCoords({ clientX, clientY });
      const spherePosition = spherePositionAtDeviceCoords(deviceCoords);

      if (spherePosition) {
        const globeCoords = mapUtils.coords(spherePosition, radius)
        setMapCenter(globeCoords);
      }
    }

    shouldPropagateChanges.current = false;
    canvasRef.current.removeEventListener(
      'pointermove',
      handlePointerMove.current,
    );
    canvasRef.current.removeEventListener('pointerup', handlePointerUp.current);
  });

  // on pointer down
  const onPointerDown = useRef(({ clientX, clientY }) => {
    shouldPropagateChanges.current = true;
    // store down position
    positionRef.current.set(clientX, clientY);

    // add event listeners
    canvasRef.current.addEventListener(
      'pointermove',
      handlePointerMove.current,
    );
    canvasRef.current.addEventListener('pointerup', handlePointerUp.current);
  });

  // set on pointer down event handlers when canvas updates
  useEffect(
    () => {
      if (!canvasRef.current) return;
      canvasRef.current.addEventListener('pointerdown', onPointerDown.current);

      return () => {
        canvasRef.current.removeEventListener(
          'pointerdown',
          onPointerDown.current,
        );
      };
    },
    [canvasRef.current],
  );

  useEffect(
    () => {
      if (!shouldPropagateChanges.current) {
        const position = mapUtils.vertex([mapCenter[1], mapCenter[0]], radius);
        const altitude = getCameraAltitude();
        pointCameraAtSpherePosition(position, altitude);
      }
    },
    [mapCenter],
  );

  return null;
};

export default GlobeContainer;
