import * as THREE from 'three';

const METER_WIDTH = 16;
const METER_HEIGHT = 4;

export const setupMeter = ({ scene, camera }) => {
  const { top, right } = camera;
  const meterOutlineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const meterOutlineGeometry = new THREE.Geometry();
  meterOutlineGeometry.vertices.push(
    new THREE.Vector3(METER_WIDTH, 0, 0),
    new THREE.Vector3(METER_WIDTH, METER_HEIGHT, 0),
    new THREE.Vector3(0, METER_HEIGHT, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(METER_WIDTH, 0, 0),
  );
  const meterOutline = new THREE.Line(meterOutlineGeometry, meterOutlineMaterial);
  meterOutline.position.x = right - METER_HEIGHT - METER_WIDTH;
  meterOutline.position.y = top - (2 * METER_HEIGHT);

  const meterMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const meterGeometry = meterOutlineGeometry.clone();
  meterGeometry.faces = [
    new THREE.Face3(0, 1, 2),
    new THREE.Face3(2,3,4)
  ];
  const meter = new THREE.Mesh(meterGeometry, meterMaterial);
  meter.position.x = right - METER_HEIGHT - METER_WIDTH
  meter.position.y = top - (2 * METER_HEIGHT)

  scene.add(meterOutline);
  scene.add(meter);

  return {
    meter,
    meterOutline,
  };
};

export const destroyMeter = ({scene}, { meter, meterOutline }) => {
  scene.remove(meter);
  scene.remove(meterOutline)
};

export const updateMeter = (entity, laserStrength) => {
  const { meter } = entity;

  meter.geometry.vertices[0].x = METER_WIDTH * laserStrength;
  meter.geometry.vertices[1].x = METER_WIDTH * laserStrength;
  meter.geometry.vertices[4].x = METER_WIDTH * laserStrength;

  meter.geometry.verticesNeedUpdate = true;
}
