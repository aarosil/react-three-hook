import { useEffect, useState } from 'react';

export default function useWorldMap() {
  const [mapData, setMapData] = useState();

  async function getMapData() {
    const response = await fetch(
      'https://unpkg.com/world-atlas@1/world/50m.json',
    );
    const data = await response.json();

    setMapData(data);
  }

  useEffect(() => {
    getMapData();
  }, []);

  return mapData;
}
