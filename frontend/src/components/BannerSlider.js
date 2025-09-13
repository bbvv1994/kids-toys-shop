import React, { useState, useEffect } from 'react';
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useSwipeable } from 'react-swipeable';
import CircleIcon from '@mui/icons-material/Circle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BannerSlider = ({ drawerWidth = 280 }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isRTL = i18n.language === 'he';

  // Данные баннеров с оптимизацией
  const banners = [
    {
      id: 1,
      image: '/banners/glav.webp',
      title: t('banners.welcome.title'),
      subtitle: t('banners.welcome.subtitle'),
      link: '/catalog',
      clickable: false // Первый баннер не кликабельный
    },
    {
      id: 2,
      image: '/banners/sale1.webp',
      title: t('banners.specialOffers.title'),
      subtitle: t('banners.specialOffers.subtitle'),
      link: '/category/384',
      clickable: true
    },
    {
      id: 3,
      image: '/banners/malysham.webp',
      title: t('banners.forLittleOnes.title'),
      subtitle: t('banners.forLittleOnes.subtitle'),
      link: '/category/401',
      clickable: true
    },
    {
      id: 4,
      image: '/banners/plyazhniy.webp',
      title: t('banners.waterRecreation.title'),
      subtitle: t('banners.waterRecreation.subtitle'),
      link: '/category/380',
      clickable: true
    },
    {
      id: 5,
      image: '/banners/vshkolu.webp',
      title: t('banners.toSchool.title'),
      subtitle: t('banners.toSchool.subtitle'),
      link: '/category/381',
      clickable: true
    },
    {
      id: 6,
      image: '/banners/mal.webp',
      title: t('catalog.pages.boysToys.title'),
      subtitle: t('catalog.pages.boysToys.subtitle'),
      link: '/boys-toys',
      clickable: true
    },
    {
      id: 7,
      image: '/banners/dev.webp',
      title: t('catalog.pages.girlsToys.title'),
      subtitle: t('catalog.pages.girlsToys.subtitle'),
      link: '/girls-toys',
      clickable: true
    },
  ];

  const [index, setIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Автопрокрутка (каждые 5 секунд)
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying, banners.length]);

  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        // Стрелка влево = переход к предыдущему баннеру
        setIndex((prev) => (prev - 1 + banners.length) % banners.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 3000);
      } else if (e.key === 'ArrowRight') {
        // Стрелка вправо = переход к следующему баннеру
        setIndex((prev) => (prev + 1) % banners.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 3000);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying(!isAutoPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAutoPlaying, banners.length]);

  // Остановка автопереключения при наведении
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Свайпы для мобилок (исправленная логика)
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      // Свайп влево = переход к следующему баннеру
      setIndex((prev) => (prev + 1) % banners.length);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 3000);
    },
    onSwipedRight: () => {
      // Свайп вправо = переход к предыдущему баннеру
      setIndex((prev) => (prev - 1 + banners.length) % banners.length);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 3000);
    },
    trackMouse: true, // можно свайпать и мышкой
    preventDefaultTouchmoveEvent: true,
    delta: 10 // минимальное расстояние для свайпа
  });

  // Адаптивные размеры (упрощенные)
  const getBannerStyles = () => {
    if (isMobile) {
      return {
        height: 200,
        width: 'calc(100% - 32px)',
        margin: '0 auto',
        borderRadius: 8
      };
    }
    
    if (isTablet) {
      return {
        height: 300,
        width: 'calc(100% - 40px)',
        margin: '0 auto',
        borderRadius: 12
      };
    }
    
    // Десктоп: адаптивная ширина
    const screenWidth = window.innerWidth;
    const leftMargin = 35;
    const rightMargin = 16;
    const availableWidth = screenWidth - leftMargin - rightMargin;
    const widthPercentage = screenWidth >= 1920 ? 0.85 : 
                           screenWidth >= 1440 ? 0.82 : 
                           screenWidth >= 1200 ? 0.80 : 
                           screenWidth >= 1024 ? 0.78 : 0.75;
    
    return {
      height: 400,
      width: availableWidth * widthPercentage,
      marginLeft: leftMargin,
      marginRight: rightMargin,
      marginTop: -6,
      borderRadius: 16
    };
  };

  const bannerStyles = getBannerStyles();

  // Обработка клика по баннеру
  const handleBannerClick = (banner) => {
    if (banner.clickable && banner.link) {
      navigate(banner.link);
    }
  };

  return (
    <Box
      {...handlers}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        position: 'relative',
        width: '100%',
        height: bannerStyles.height,
        marginBottom: 3,
        overflow: 'hidden',
        borderRadius: bannerStyles.borderRadius,
        boxShadow: 3,
        mx: 'auto',
        ...bannerStyles
      }}
    >
      {/* Баннеры с CSS transform (GPU ускорение) */}
      <Box
        sx={{
          display: 'flex',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateX(-${index * 100}%)`,
          height: '100%',
          willChange: 'transform' // Оптимизация для GPU
        }}
      >
        {banners.map((banner, i) => (
          <Box
            key={banner.id}
            sx={{
              width: '100%',
              height: '100%',
              flexShrink: 0,
              position: 'relative',
              cursor: banner.clickable ? 'pointer' : 'default',
              backgroundImage: `url(${banner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            onClick={() => handleBannerClick(banner)}
          >
            {/* Контент баннера (только для баннеров с текстом) */}
            {banner.title && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 2,
                  px: 3,
                  pb: 4,
                  textAlign: 'center',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
                  color: 'white'
                }}
              >
                <Box
                  component="h2"
                  sx={{
                    fontSize: isMobile ? '1.5rem' : isTablet ? '2.2rem' : '3rem',
                    fontWeight: 'bold',
                    margin: 0,
                    marginBottom: '0.5rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    direction: isRTL ? 'rtl' : 'ltr'
                  }}
                >
                  {banner.title}
                </Box>
                
                {banner.subtitle && (
                  <Box
                    component="p"
                    sx={{
                      fontSize: isMobile ? '1rem' : '1.4rem',
                      margin: 0,
                      opacity: 0.9,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                      direction: isRTL ? 'rtl' : 'ltr'
                    }}
                  >
                    {banner.subtitle}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Точки-навигация (оптимизированные) */}
      {banners.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 3
          }}
        >
          {banners.map((_, i) => (
            <IconButton
              key={i}
              size="small"
              onClick={() => {
                setIndex(i);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 3000);
              }}
              sx={{
                color: 'white',
                padding: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              {i === index ? (
                <CircleIcon fontSize="small" />
              ) : (
                <CircleOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BannerSlider;
