import * as THREE from 'three';

export const setupSpaceship = (scene) => {
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const geometry = new THREE.Geometry();
  const group = new THREE.Group();
  
  geometry.vertices.push(
    new THREE.Vector3(0, 10, 0),
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(0, 2.5, 0),
    new THREE.Vector3(5, 0, 0),
    new THREE.Vector3(0, 10, 0),
  );
    
  const line = new THREE.Line( geometry, material );
  const box = new THREE.Box3().setFromObject(line);

  box.getCenter(line.position);
  line.position.multiplyScalar(-1);
  group.position.y = -50
  group.add(line);
  scene.add(group);

  return {
    group,
    line,
  };
}
