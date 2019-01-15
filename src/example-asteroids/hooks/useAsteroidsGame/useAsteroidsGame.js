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
  
  const [{ laserbeams, asteroids }, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'SHOOT_LASER':
          return {
            ...state,
            laserbeams: [
              ...state.laserbeams,
              generateLaserbeam(action),
            ],
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
    shootLaser: (position, direction) => 
      dispatch({
        type: 'SHOOT_LASER', 
        position, 
        direction,
      }),
  };
}

export default useAsteroidsGame;
