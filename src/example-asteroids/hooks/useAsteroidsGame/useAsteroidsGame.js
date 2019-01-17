import { useThree } from '../../../ThreeJSManager';
import { 
  useEffect, 
  useReducer, 
  useRef,
} from 'react'; 
import {
  generateLaserbeam,
  makeBoundingBoxFromCamera,
  proceedGame,
  setupAsteroids,
} from './useAsteroidsGameUtil';

const useAsteroidsGame = ({ asteroidCount }) => {
  const {
    scene, 
    timer, 
    camera,
  } = useThree();

  const boundingBoxRef = useRef(makeBoundingBoxFromCamera(camera));
  
  const [{ laserbeams, asteroids, laserStrength }, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'SHOOT_LASER':
          const updatedLaserbeams = state.laserStrength > 0.5
            ? [
              ...state.laserbeams,
              generateLaserbeam(action),
            ]
            : state.laserbeams
          return {
            ...state,
            laserbeams: updatedLaserbeams,
            laserStrength: state.laserStrength > 0.5
              ? Math.max(0, state.laserStrength - 0.5)
              : state.laserStrength,
          };
        case 'ADVANCE_GAME':
          const {
            laserbeams,
            asteroids,
          } = proceedGame(state);
    
          return {
            ...state,
            laserbeams,
            asteroids,
            laserStrength: Math.min(1, state.laserStrength + 0.02),
          };
        default:
          return state;
      }
    },
    {
      asteroids: setupAsteroids(asteroidCount, boundingBoxRef.current),
      laserbeams: [],
      scene,
      boundingBox: boundingBoxRef.current,
      laserStrength: 1,
    },
  );
  
  useEffect(
    () => dispatch({
      type: 'ADVANCE_GAME',
    }),
    [timer],
  );
  
  return {
    laserbeams,
    asteroids,
    laserStrength,
    shootLaser: (position, direction) => 
      dispatch({
        type: 'SHOOT_LASER', 
        position, 
        direction,
      }),
  };
}

export default useAsteroidsGame;
