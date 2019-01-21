import * as THREE from 'three';
import { useEffect, useState, useRef } from 'react';
import * as mapUtils from '../mapUtils';
import { useThree } from '../../ThreeJSManager';

var raycaster = new THREE.Raycaster();

const useGlobeControls = (getEntity, getControls, setGlobeCenter) => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const isMoving = useRef();

  useThree(({ camera, canvas }) => {
    canvasRef.current = canvas;
    cameraRef.current = camera;
  }, []);

  const normalizedDeviceCoordinates = ({ clientX, clientY }) => {
    const bbox = canvasRef.current.getBoundingClientRect();
    return {
      x: ((clientX - bbox.x) / bbox.width) * 2 - 1,
      y: -(((clientY - bbox.y) / bbox.height) * 2) + 1,
    };
  };

  const getGlobeCoordsAtNormalizedDeviceCoordinates = (
    { x = 0, y = 0 },
    resetCamera,
  ) => {
    raycaster.setFromCamera({ x, y }, cameraRef.current);
    const raycastObject = getEntity();
    const intersects = raycaster.intersectObject(raycastObject);

    if (intersects.length) {
      const [lat, lon] = mapUtils.coords(intersects[0].point, 100);
      setGlobeCenter([lat, lon]);
      if (resetCamera) {
        const { camera, controls } = getControls();

        const { x, y, z } = cameraRef.current.position;
        const { x: ix, y: iy, z: iz } = intersects[0].point;
        var altitude =
          Math.sqrt(x * x + y * y + z * z) -
          Math.sqrt(ix * ix + iy * iy + iz * iz);
        console.log('aLTITUDE: ', altitude);

        var coeff = 1 + altitude / Math.sqrt(ix * ix + iy * iy + iz * iz);

        camera.position.x = intersects[0].point.x * coeff;
        camera.position.y = intersects[0].point.y * coeff;
        camera.position.z = intersects[0].point.z * coeff;
        controls.update();
      }
    }
  };

  // on pointer move
  const handlePointerMove = useRef(() => {
    isMoving.current = true;
    getGlobeCoordsAtNormalizedDeviceCoordinates({ x: 0, y: 0 });
  });

  // on pointer up
  const handlePointerUp = useRef(event => {
    if (!isMoving.current) {
      const coords = normalizedDeviceCoordinates(event);
      getGlobeCoordsAtNormalizedDeviceCoordinates(coords, true);
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
