import { useThree } from '../../../ThreeJSManager';
import { useKnobs } from '../useKnobs';
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

const DIMINISH_STRENGTH_PERCENTAGE = 0.5;
const RECHARGE_RATE_PERCENTAGE = 0.02;

const useAsteroidsGame = ({ asteroidCount }) => {
  const {
    scene,
    timer,
    camera,
  } = useThree();

  const boundingBoxRef = useRef(makeBoundingBoxFromCamera(camera));

  const [values, knobs] = useKnobs({
    RECHARGE_RATE_PERCENTAGE,
    DIMINISH_STRENGTH_PERCENTAGE,
  });

  const [{ laserbeams, asteroids, laserStrength }, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'SHOOT_LASER':
          const updatedLaserbeams = state.laserStrength > values.DIMINISH_STRENGTH_PERCENTAGE
            ? [
              ...state.laserbeams,
              generateLaserbeam(action),
            ]
            : state.laserbeams
          return {
            ...state,
            laserbeams: updatedLaserbeams,
            laserStrength: state.laserStrength > values.DIMINISH_STRENGTH_PERCENTAGE
              ? Math.max(0, state.laserStrength - values.DIMINISH_STRENGTH_PERCENTAGE)
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
            laserStrength: Math.min(1, state.laserStrength + values.RECHARGE_RATE_PERCENTAGE),
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
    knobs,
    shootLaser: (position, direction) =>
      dispatch({
        type: 'SHOOT_LASER',
        position,
        direction,
      }),
  };
}

export default useAsteroidsGame;
