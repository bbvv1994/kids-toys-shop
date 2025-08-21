import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

// Исправляем проблему с иконками маркеров в Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const OpenStreetMapComponent = ({ stores, center, zoom = 8 }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const defaultCenter = {
    lat: 31.9268, // Центр Израиля
    lng: 34.9977
  };

  // Выбираем тайлы в зависимости от языка
  const getTileLayerUrl = () => {
    // Используем стандартные OpenStreetMap тайлы для всех языков
    return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  // Получаем атрибуцию в зависимости от языка
  const getAttribution = () => {
    switch (currentLanguage) {
      case 'ru':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> участники';
      case 'he':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  // Примечание: Карты используют стандартные OpenStreetMap тайлы
  // Названия улиц отображаются на иврите (местный язык)

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <MapContainer
        center={center || defaultCenter}
        zoom={zoom}
        style={mapContainerStyle}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={getAttribution()}
          url={getTileLayerUrl()}
          maxZoom={19}
        />
        
        {stores.map((store, index) => (
          <Marker
            key={index}
            position={store.coordinates}
            icon={new L.Icon({
              iconUrl: '/lion-logo.png..png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [68, 68],
              iconAnchor: [34, 68],
              popupAnchor: [0, -68],
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
