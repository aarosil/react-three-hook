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

const MapContainer = ({ mapCenter = [37.7, -122.2] }) => {
  const [lat, lon] = mapCenter;
  const mapRef = useRef();

  useEffect(() => {
    const { template, ...config } = mapConfig;
    mapRef.current = window.L.map('map-root').setView([lat, lon], 8);
    window.L.tileLayer(template, config).addTo(mapRef.current);
  }, []);

  useEffect(
    () => {
      if (!(mapRef.current && mapCenter)) return;
      mapRef.current.panTo(mapCenter);
    },
    [mapCenter]
  );

  return <div id="map-root" style={{ height: '100vh' }} />;
};

export default MapContainer;
