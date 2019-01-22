import * as THREE from 'three';
import * as topojson from 'topojson';
import * as mapUtils from './mapUtils';
import { useThree } from '../ThreeJSManager';
import useGlobeControls from './hooks/useGlobeControls';

const GlobeContainer = ({ mapData, radius = 100, setMapCenter, getControls }) => {
  const { getEntity } = useThree(({ scene, camera }) => {
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

  useGlobeControls(getEntity, getControls, setMapCenter);

  return null;
};

export default GlobeContainer;
