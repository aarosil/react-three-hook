import { useContext, useEffect, useRef } from 'react';
import { ThreeJSContext } from './ThreeJSManager';

const noop = () => {};

const useThree = (setup = noop, destroy) => {
  const entityRef = useRef();
  const context = useContext(ThreeJSContext);

  const getEntity = () => entityRef.current;

  useEffect(() => {
    entityRef.current = setup(context);

    return () => {
      if (destroy) {
        return destroy(context, getEntity());
      }
      context.scene.remove(getEntity());
    };
  }, []);

  return {
    getEntity,
    ...context,
  };
};

export default useThree;
