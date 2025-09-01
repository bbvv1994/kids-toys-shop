import React, { useState, useEffect } from 'react';
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomeBanners = ({ drawerWidth = 280 }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isRTL = i18n.language === 'he';
  
  // Отладочная информация для размеров экрана
  console.log('HomeBanners: isMobile:', isMobile);
  console.log('HomeBanners: isTablet:', isTablet);
  console.log('HomeBanners: drawerWidth:', drawerWidth);
  
  // Данные баннеров (можно вынести в отдельный файл или получать с сервера)
  const banners = [
    {
      id: 1,
      image: '/banners/glav.webp',
      title: t('banners.welcome.title'),
      subtitle: t('banners.welcome.subtitle'),
      link: '/catalog',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      image: '/banners/sale1.webp',
      title: t('banners.specialOffers.title'),
      subtitle: t('banners.specialOffers.subtitle'),
      link: '/category/384',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    },
    {
      id: 3,
      image: '/banners/malysham.webp',
      title: t('banners.forLittleOnes.title'),
      subtitle: t('banners.forLittleOnes.subtitle'),
      link: '/category/401',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      id: 4,
      image: '/banners/plyazhniy.webp',
      title: t('banners.waterRecreation.title'),
      subtitle: t('banners.waterRecreation.subtitle'),
      link: '/category/380',
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    },
    {
      id: 5,
      image: '/banners/vshkolu.webp',
      title: t('banners.toSchool.title'),
      subtitle: t('banners.toSchool.subtitle'),
      link: '/category/381',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      id: 6,
      image: '/banners/mal.webp',
      title: t('catalog.pages.boysToys.title'),
      subtitle: t('catalog.pages.boysToys.subtitle'),
      link: '/boys-toys',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 7,
      image: '/banners/dev.webp',
      title: t('catalog.pages.girlsToys.title'),
      subtitle: t('catalog.pages.girlsToys.subtitle'),
      link: '/girls-toys',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    },
  ];

  // Отладочная информация
  console.log('HomeBanners: Компонент загружен');
  console.log('HomeBanners: Количество баннеров:', banners.length);
  console.log('HomeBanners: Первый баннер:', banners[0]);

  const [currentBanner, setCurrentBanner] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Автоматическое переключение банеров
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  // Отслеживание изменения размера окна для мгновенного обновления стилей
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        isRTL ? nextBanner() : prevBanner();
      } else if (e.key === 'ArrowRight') {
        isRTL ? prevBanner() : nextBanner();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying(!isAutoPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAutoPlaying, isRTL]);

  // Остановка автопереключения при наведении
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToBanner = (index) => {
    setCurrentBanner(index);
  };

  // Функции для обработки свайпов
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
    // Останавливаем автопереключение при начале свайпа
    setIsAutoPlaying(false);
  };

  const onTouchMove = (e) => {
    if (isSwiping) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 30; // Уменьшаем минимальное расстояние для свайпа
    
    let isLeftSwipe, isRightSwipe;
    
    if (isRTL) {
      // Для RTL языков инвертируем логику
      isLeftSwipe = distance < -minSwipeDistance;
      isRightSwipe = distance > minSwipeDistance;
    } else {
      isLeftSwipe = distance > minSwipeDistance;
      isRightSwipe = distance < -minSwipeDistance;
    }

    if (isLeftSwipe) {
      nextBanner();
    } else if (isRightSwipe) {
      prevBanner();
    }
    
    // Сбрасываем состояние свайпа
    setIsSwiping(false);
    
    // Возобновляем автопереключение через 3 секунды после свайпа
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // Адаптивные размеры
  const getBannerStyles = () => {
    const screenWidth = windowSize.width;
    
    if (isMobile) {
      return {
        height: 200,
        width: 'calc(100% - 32px)',
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 8,
        transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out'
      };
    }
    
    if (isTablet) {
      return {
        height: 300,
        width: 'calc(100% - 40px)',
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 12,
        transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out'
      };
    }
    
    // Десктоп: полностью адаптивная ширина с фиксированными отступами
    const leftMargin = 35;
    const rightMargin = 16;
    const availableWidth = screenWidth - leftMargin - rightMargin;
    
    // Плавно изменяющаяся ширина от 75% до 85% в зависимости от размера экрана
    // Используем Math.max и Math.min для плавного перехода
    const minWidth = availableWidth * 0.75; // Минимум 75%
    const maxWidth = availableWidth * 0.85; // Максимум 85%
    
    // Плавный переход между размерами экрана
    let widthPercentage;
    if (screenWidth >= 1920) {
      widthPercentage = 0.85;
    } else if (screenWidth >= 1440) {
      widthPercentage = 0.82;
    } else if (screenWidth >= 1200) {
      widthPercentage = 0.80;
    } else if (screenWidth >= 1024) {
      widthPercentage = 0.78;
    } else {
      widthPercentage = 0.75;
    }
    
    const bannerWidth = availableWidth * widthPercentage;
    
    return {
      height: 400,
      width: bannerWidth,
      marginLeft: leftMargin,
      marginRight: rightMargin,
      marginTop: -6,
      borderRadius: 16,
      transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out'
    };
  };

  const bannerStyles = getBannerStyles();

  // Отладочная информация для рендера
  console.log('HomeBanners: Рендеринг компонента');
  console.log('HomeBanners: Текущий баннер:', currentBanner);
  console.log('HomeBanners: Стили баннера:', bannerStyles);
  console.log('HomeBanners: Размеры экрана - ширина:', windowSize.width);
  console.log('HomeBanners: Размеры экрана - высота:', windowSize.height);
  console.log('HomeBanners: Применяемые размеры - мобильный:', isMobile, 'планшет:', isTablet);
  console.log('HomeBanners: marginTop для десктопа:', isMobile ? 'не применяется' : isTablet ? 'не применяется' : bannerStyles.marginTop);
  console.log('HomeBanners: Состояние свайпа:', isSwiping);
  console.log('HomeBanners: Автопереключение:', isAutoPlaying);
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: bannerStyles.height,
        marginBottom: 3,
        overflow: 'hidden',
        touchAction: 'pan-y', // Разрешаем вертикальный скролл, но блокируем горизонтальный
        userSelect: 'none', // Запрещаем выделение текста при свайпе
        WebkitUserSelect: 'none', // Для Safari
        cursor: isSwiping ? 'grabbing' : 'grab', // Визуальная обратная связь
        transition: 'cursor 0.2s ease',
        ...bannerStyles
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Банеры */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: `url(${banners[currentBanner].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: isRTL ? 'right' : 'left',
              color: 'white',
              cursor: currentBanner === 0 ? 'default' : 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => {
              // Навигация по клику на банер (кроме первого баннера "Добро пожаловать")
              if (currentBanner !== 0) {
                navigate(banners[currentBanner].link);
              }
            }}
          >

            
            {/* Контент баннера */}
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
                width: '100%',
                maxWidth: '600px',
                marginLeft: isRTL ? 'auto' : 'auto',
                marginRight: isRTL ? 'auto' : 'auto'
              }}
            >
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{
                  fontSize: isMobile ? '1.5rem' : isTablet ? '2.2rem' : '3rem',
                  fontWeight: 'bold',
                  margin: 0,
                  marginBottom: '0.5rem',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  direction: isRTL ? 'rtl' : 'ltr'
                }}
              >
                {banners[currentBanner].title}
              </motion.h2>
              
              {banners[currentBanner].subtitle && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  style={{
                    fontSize: isMobile ? '1rem' : '1.4rem',
                    margin: 0,
                    opacity: 0.9,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    direction: isRTL ? 'rtl' : 'ltr'
                  }}
                >
                  {banners[currentBanner].subtitle}
                </motion.p>
              )}
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* Кнопки навигации */}
      {banners.length > 1 && (
        <>
          {/* Кнопка "Назад" */}
          <IconButton
            onClick={prevBanner}
            sx={{
              position: 'absolute',
              [isRTL ? 'right' : 'left']: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: 'primary.main',
              zIndex: 3,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,1)',
                transform: 'translateY(-50%) scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {isRTL ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>

          {/* Кнопка "Вперед" */}
          <IconButton
            onClick={nextBanner}
            sx={{
              position: 'absolute',
              [isRTL ? 'left' : 'right']: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: 'primary.main',
              zIndex: 3,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,1)',
                transform: 'translateY(-50%) scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {isRTL ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </>
      )}



      {/* Индикаторы */}
      {banners.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 3
          }}
        >
          {banners.map((_, index) => (
            <Box
              key={index}
              onClick={() => goToBanner(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === currentBanner ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: index === currentBanner ? 'white' : 'rgba(255,255,255,0.8)',
                  transform: 'scale(1.2)'
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HomeBanners;
