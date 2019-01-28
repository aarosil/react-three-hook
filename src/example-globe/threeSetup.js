import * as THREE from 'three';

export const getCamera = ({ offsetWidth, offsetHeight }) => {
  const camera = new THREE.PerspectiveCamera(
    75,
    offsetWidth / offsetHeight,
    1,
    1000,
  );
  camera.position.set(120, 80, 140);

  return camera;
};

export const getRenderer = canvas => {
  const context = canvas.getContext('webgl');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context,
  });

  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  return renderer;
};

export const getScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0);

  const light = new THREE.AmbientLight(0x404040);
  scene.add(light);

  return scene;
};
