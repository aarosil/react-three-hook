import { useEffect, useState, forwardRef } from 'react';
import * as THREE from 'three';
import OrbitControlsDefault from 'three-orbit-controls';
import { useThree } from '../ThreeJSManager/';

const OrbitControls = OrbitControlsDefault(THREE);

const CameraControls = forwardRef((props, controlsRef) => {
  const [camera, setCamera] = useState();
  const [canvas, setCanvas] = useState();

  useThree(({ camera, canvas }) => {
    setCamera(camera);
    setCanvas(canvas);
  });

  useEffect(
    () => {
      if (!(camera && canvas)) return;

      const controls = new OrbitControls(camera, canvas);

      controls.enableDamping = true;
      controls.dampingFactor = 0.12;
      controls.rotateSpeed = 0.08;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.08;
      controls.enableKeys = false;
      controls.update();

      controlsRef.current = {
        camera,
        controls,
      };
    },
    [camera, canvas],
  );

  return null;
});

export default CameraControls;
