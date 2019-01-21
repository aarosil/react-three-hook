import React, { useState } from 'react';
import SceneManager from '../ThreeJSManager';
import GlobeContainer from './GlobeContainer';
import useWorldMap from './hooks/useWorldMap';
import MapContainer from './MapContainer';
import { getCamera, getRenderer, getScene } from './threeSetup';

const MapExample = () => {
  const mapData = useWorldMap();
  const [mapCenter, setMapCenter] = useState();

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
          <MapContainer mapCenter={mapCenter} />
        </div>
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <SceneManager
            getCamera={getCamera}
            getRenderer={getRenderer}
            getScene={getScene}
          >
            {mapData && (
              <GlobeContainer mapData={mapData} setMapCenter={setMapCenter} />
            )}
          </SceneManager>
        </div>
      </div>
    </div>
  );
};

export default MapExample;
