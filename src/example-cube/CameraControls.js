import * as THREE from 'three';
import OrbitControlsDefault from 'three-orbit-controls';
import { useThree } from '../ThreeJSManager/';

const OrbitControls = OrbitControlsDefault(THREE);

const CameraControls = () => {
  useThree(({ camera, canvas }) => {
    const controls = new OrbitControls(camera, canvas);

    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.rotateSpeed = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.08;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableKeys = false;
    controls.update();
  });

  return null;
};

export default CameraControls;
