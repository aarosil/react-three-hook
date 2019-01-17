import { useEffect } from 'react';
import { useThree } from '../ThreeJSManager/';
import {
  setupMeter,
  destroyMeter,
  updateMeter,
} from './LaserStrengthMeter.three';

const LaserStrengthMeter = ({ laserStrength }) => {
  const { getEntity } = useThree(
    setupMeter,
    destroyMeter,
  );

  useEffect(
    () => updateMeter(getEntity(), laserStrength),
    [laserStrength],
  );

  return null;
}

export default LaserStrengthMeter;
