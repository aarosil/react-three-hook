import * as THREE from 'three';
import { useThree } from '../ThreeJSManager/';

const Grid = () => {
  useThree(({ scene }) => {
    const grid = new THREE.GridHelper(10000, 1000);
    scene.add(grid);

    return grid;
  });

  return null;
};

export default Grid;
