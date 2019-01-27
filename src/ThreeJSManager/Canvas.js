import React from 'react';
import { forwardRef, useEffect } from 'react';

const Canvas = ({ style }, ref) => {
  const onWindowResize = () => {
    ref.current.style.height = style.height;
    ref.current.style.width = style.width;
  };

  useEffect(() => {
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return (
    <canvas ref={ref} height={style.height} width={style.width} style={style} />
  );
};

export default forwardRef(Canvas);
