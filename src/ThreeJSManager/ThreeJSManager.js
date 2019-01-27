import React from 'react';
import { createContext, useEffect, useRef, useState } from 'react';

import Canvas from './Canvas';
import useAnimationFrame from './useAnimationFrame';

export const ThreeJSContext = createContext();

const ThreeJSManager = ({
  children,
  getCamera,
  getRenderer,
  getScene,
  canvasStyle,
}) => {
  const [threeIsReady, setThreeIsReady] = useState(false);
  const [timer, updateTimer] = useState(0);
  const canvasRef = useRef({});
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();

  const { offsetWidth, offsetHeight } = canvasRef.current;
  const threeContext = {
    scene: sceneRef.current,
    camera: cameraRef.current,
    canvas: canvasRef.current,
    timer,
  };

  // setup scene, camera, and renderer, and store references
  useEffect(() => {
    const canvas = canvasRef.current;
    sceneRef.current = getScene();
    cameraRef.current = getCamera(canvas);
    rendererRef.current = getRenderer(canvas);

    setThreeIsReady(true);
  }, []);

  // update camera and renderer when dimensions change
  useEffect(
    () => {
      cameraRef.current.aspect = offsetWidth / offsetHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(offsetWidth, offsetHeight);
    },
    [offsetWidth, offsetHeight],
  );

  // set animation frame timer value and rerender the scene
  useAnimationFrame(timer => {
    updateTimer(timer);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  });

  return (
    <>
      <Canvas ref={canvasRef} style={canvasStyle} />
      {threeIsReady && (
        <ThreeJSContext.Provider value={threeContext}>
          {children}
        </ThreeJSContext.Provider>
      )}
    </>
  );
};

export default ThreeJSManager;
