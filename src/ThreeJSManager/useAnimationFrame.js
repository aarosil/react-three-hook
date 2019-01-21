import { useRef, useMutationEffect, useLayoutEffect } from 'react';

const useAnimationFrame = callback => {
  const callbackRef = useRef(callback);
  useMutationEffect(
    () => {
      callbackRef.current = callback;
    },
    [callback]
  );

  const loop = time => {
    frameRef.current = requestAnimationFrame(loop);
    const cb = callbackRef.current;
    cb(time);
  };

  const frameRef = useRef();
  useLayoutEffect(() => {
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);
};

export default useAnimationFrame;
