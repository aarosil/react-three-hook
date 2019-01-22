import * as THREE from 'three';
import { useEffect, useState, useRef } from 'react';
import * as mapUtils from '../mapUtils';
import { useThree } from '../../ThreeJSManager';

var raycaster = new THREE.Raycaster();

const useGlobeControls = (getEntity, getControls, setMapCenter) => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const isMoving = useRef();

  useThree(({ camera, canvas }) => {
    canvasRef.current = canvas;
    cameraRef.current = camera;
  });

  // between -1 and 1 for X,Y over the canvas element
  const normalizedDeviceCoords = ({ clientX, clientY }) => {
    const bbox = canvasRef.current.getBoundingClientRect();
    return {
      x: ((clientX - bbox.x) / bbox.width) * 2 - 1,
      y: -(((clientY - bbox.y) / bbox.height) * 2) + 1,
    };
  };

  // the point on the sphere the pointer is above
  const spherePointAtDeviceCoords = ({ x = 0, y = 0 }) => {
    raycaster.setFromCamera({ x, y }, cameraRef.current);
    const raycastObject = getEntity();
    const intersects = raycaster.intersectObject(raycastObject);

    if (intersects.length) return intersects[0].point;
  };

  // lat / long of a point on the sphere
  const globeCoordsAtSpherePoint = (point) => {
    const { x, y, z } = point;
    const radius = Math.sqrt(x * x + y * y + z * z);
    const [lat, lon] = mapUtils.coords(point, radius);

    return [lat, lon];
  };

  // focus camera at a given point
  const pointCameraAtSpherePoint = (point) => {
    const { x: px, y: py, z: pz } = point;
    const radius = Math.sqrt(px * px + py * py + pz * pz);

    const { x: cx, y: cy, z: cz, } = cameraRef.current.position;
    var altitude = Math.sqrt(cx * cx + cy * cy + cz * cz) - radius;

    var coeff = 1 + altitude / radius;

    cameraRef.current.position.x = point.x * coeff;
    cameraRef.current.position.y = point.y * coeff;
    cameraRef.current.position.z = point.z * coeff;

    const controls = getControls();
    controls.update();
  };

  // on pointer move
  const handlePointerMove = useRef(() => {
    isMoving.current = true;

    const spherePoint = spherePointAtDeviceCoords({ x: 0, y: 0 });
    const [lat, lon] = globeCoordsAtSpherePoint(spherePoint)

    setMapCenter([lat, lon]);
  });

  // on pointer up
  const handlePointerUp = useRef(event => {
    if (!isMoving.current) {
      const deviceCoords = normalizedDeviceCoords(event);
      const spherePosition = spherePointAtDeviceCoords(deviceCoords);

      if (spherePosition) {
        const globeCoords = globeCoordsAtSpherePoint(spherePosition);

        setMapCenter(globeCoords);
        pointCameraAtSpherePoint(spherePosition);
      }
    }

    canvasRef.current.removeEventListener(
      'pointermove',
      handlePointerMove.current,
    );
    canvasRef.current.removeEventListener('pointerup', handlePointerUp.current);
  });

  // on pointer down
  const onPointerDown = useRef(() => {
    isMoving.current = false;
    canvasRef.current.addEventListener(
      'pointermove',
      handlePointerMove.current,
    );
    canvasRef.current.addEventListener('pointerup', handlePointerUp.current);
  });

  // set on pointer down when canvas updates
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
};

export default useGlobeControls;
