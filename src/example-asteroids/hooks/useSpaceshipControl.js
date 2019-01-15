import { useEffect, useRef } from 'react';

const LEFT_ARROW_KEYCODE = 37;
const RIGHT_ARROW_KEYCODE = 39;

const useSpaceshipControl = ({ turnSpeed }) => {
  const rotation = useRef(0);

  const getDirection = (event) => {
    switch (event.keyCode) {
      case LEFT_ARROW_KEYCODE:
        return 1;
      case RIGHT_ARROW_KEYCODE:
        return -1;
      default:
    }
  }

  const handleControlKey = (event) => {
    const direction = getDirection(event);

    if (direction) {
      const rotationChange = turnSpeed * direction * Math.PI/180;
      rotation.current += rotationChange;
    }
  }

  useEffect(
    () => {
      window.addEventListener('keydown', handleControlKey);

      return () => {
        window.removeEventListener('keydown', handleControlKey);
      };
    },
    [],
  );

  return rotation.current;
}

export default useSpaceshipControl;
