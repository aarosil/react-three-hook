import React from 'react';
import {
  forwardRef,
  useEffect,
} from 'react';

const Canvas = (_, ref) => {
  const onWindowResize = () => {
    ref.current.setAttribute(
      'style',
      'z-index: -1; position: absolute; height: 100%; width: 100%;',
    );
  };

  useEffect(
    () => {
      window.addEventListener('resize', onWindowResize)
      return () => {
        window.removeEventListener('resize', onWindowResize)
      }
    },
    [],
  );

  return (
    <canvas
      ref={ref}
      style={{
        zIndex: -1,
        position: 'absolute',
        height: '100%',
        width: '100%',
      }}
    />
  );
}

export default forwardRef(Canvas);
