import React, { useEffect, useRef } from 'react';

const mapConfig = {
  template:
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 10,
  id: 'mapbox.streets',
  accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
};

const MapContainer = ({ mapCenter, setMapCenter }) => {
  const [lat, lon] = mapCenter;
  const mapRef = useRef();
  const shouldPropagateChange = useRef(true);

  const onMoveRef = useRef(() => {
    if (shouldPropagateChange.current) {
      const { lat, lng } = mapRef.current.getCenter();
      if (shouldPropagateChange.current) setMapCenter([lat, lng]);
    }
  });

  const onClickRef = useRef(({ originalEvent }) => {
    const { lat, lng } = mapRef.current.mouseEventToLatLng(originalEvent);
    setMapCenter([lat, lng]);
  });

  const onMoveEndRef = useRef(() => shouldPropagateChange.current = true);

  useEffect(() => {
    const { template, ...config } = mapConfig;
    const map = window.L.map('map-root').setView([lat, lon], 8);
    window.L.tileLayer(template, config).addTo(map);

    map.on('move', onMoveRef.current);
    map.on('moveend', onMoveEndRef.current);
    map.on('click', onClickRef.current);

    mapRef.current = map;
  }, []);

  useEffect(
    () => {
      if (!(mapRef.current)) return;

      shouldPropagateChange.current = false;
      mapRef.current.panTo(mapCenter);
    },
    [mapCenter],
  );

  return (
    <div id="map-root" style={{ height: '100vh' }} />
  );
};

export default MapContainer;
