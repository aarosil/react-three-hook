import React, { useState, useRef } from 'react';
import SceneManager from '../ThreeJSManager';
import GlobeContainer from './GlobeContainer';
import useWorldMap from './hooks/useWorldMap';
import MapContainer from './MapContainer';
import CameraControls from './CameraControls';
import { getCamera, getRenderer, getScene } from './threeSetup';

const MapExample = () => {
  const cameraControlsRef = useRef();
  const thaBay = [37.7, -122.2];
  const mapData = useWorldMap();
  const [mapCenter, setMapCenter] = useState(thaBay);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: 1,
        }}
      >
        <div
          style={{
            width: '50vw',
          }}
        >
          <MapContainer mapCenter={mapCenter} setMapCenter={setMapCenter} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <SceneManager
            getCamera={getCamera}
            getRenderer={getRenderer}
            getScene={getScene}
            canvasStyle={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexGrow: 1,
              zIndex: -1,
            }}
          >
            {mapData && (
              <GlobeContainer
                getCameraControls={() => cameraControlsRef.current}
                mapData={mapData}
                setMapCenter={setMapCenter}
                mapCenter={mapCenter}
              />
            )}
            <CameraControls ref={cameraControlsRef} />;
          </SceneManager>
        </div>
      </div>
    </div>
  );
};

export default MapExample;
