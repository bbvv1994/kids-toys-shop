import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Исправляем проблему с иконками маркеров в Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const OpenStreetMapComponent = ({ stores, center, zoom = 8 }) => {
  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const defaultCenter = {
    lat: 31.9268, // Центр Израиля
    lng: 34.9977
  };

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <MapContainer
        center={center || defaultCenter}
        zoom={zoom}
        style={mapContainerStyle}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {stores.map((store, index) => (
          <Marker
            key={index}
            position={store.coordinates}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          >
            <Popup>
              <Box sx={{ p: 1, minWidth: 200 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {store.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  {store.address}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {store.phone}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default OpenStreetMapComponent;
