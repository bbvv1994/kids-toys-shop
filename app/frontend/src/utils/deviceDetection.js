// Утилита для определения мобильного устройства по User Agent
// Не зависит от размера окна браузера
import React from 'react';

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Проверяем мобильные устройства по User Agent
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  
  // Дополнительная проверка на touch-устройства
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Проверяем размер экрана устройства (не окна браузера)
  const screenWidth = window.screen.width;
  const isSmallScreen = screenWidth <= 768;
  
  return mobileRegex.test(userAgent) || (hasTouchScreen && isSmallScreen);
};

// Хук для использования в React компонентах
export const useIsMobileDevice = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);
  
  return isMobile;
};

// Альтернативный хук с более точным определением
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = React.useState('desktop');
  
  React.useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      setDeviceType('mobile');
    } else if (/Android/.test(userAgent)) {
      if (/Mobile/.test(userAgent)) {
        setDeviceType('mobile');
      } else {
        setDeviceType('tablet');
      }
    } else if ('ontouchstart' in window && window.screen.width <= 768) {
      setDeviceType('mobile');
    } else if ('ontouchstart' in window && window.screen.width <= 1024) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  }, []);
  
  return deviceType;
};
