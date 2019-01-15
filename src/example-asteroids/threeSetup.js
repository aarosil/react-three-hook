import * as THREE from 'three';

export const getCamera = ({ offsetWidth, offsetHeight }) => {
  const viewSize = 150
  const aspectRatio = offsetWidth/offsetHeight
	const camera = new THREE.OrthographicCamera(
    -aspectRatio * viewSize / 2, 
    aspectRatio * viewSize / 2,
		viewSize / 2, -viewSize / 2,
    0,
    1,
  );
  return camera;
};

export const getRenderer = (canvas) => {
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

  return scene;
}
