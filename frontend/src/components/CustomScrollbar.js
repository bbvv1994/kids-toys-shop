import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const CustomScrollbar = ({ children, height = '100vh', width = '100%' }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScrollTop, setDragStartScrollTop] = useState(0);
  
  const containerRef = useRef(null);
  const scrollbarRef = useRef(null);
  const thumbRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScrollInfo = () => {
      setScrollTop(container.scrollTop);
      setScrollHeight(container.scrollHeight);
      setClientHeight(container.clientHeight);
    };

    updateScrollInfo();
    container.addEventListener('scroll', updateScrollInfo);
    window.addEventListener('resize', updateScrollInfo);

    return () => {
      container.removeEventListener('scroll', updateScrollInfo);
      window.removeEventListener('resize', updateScrollInfo);
    };
  }, []);

  const handleScrollbarClick = (e) => {
    const container = containerRef.current;
    const scrollbar = scrollbarRef.current;
    if (!container || !scrollbar) return;

    const rect = scrollbar.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const scrollbarHeight = rect.height;
    const scrollRatio = clickY / scrollbarHeight;
    
    const newScrollTop = scrollRatio * (scrollHeight - clientHeight);
    container.scrollTo({
      top: newScrollTop,
      behavior: 'smooth'
    });
  };

  const handleThumbMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartScrollTop(scrollTop);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const container = containerRef.current;
      const scrollbar = scrollbarRef.current;
      if (!container || !scrollbar) return;

      const rect = scrollbar.getBoundingClientRect();
      const scrollbarHeight = rect.height;
      const deltaY = e.clientY - dragStartY;
      const scrollRatio = deltaY / scrollbarHeight;
      
      const newScrollTop = dragStartScrollTop + (scrollRatio * (scrollHeight - clientHeight));
      container.scrollTop = Math.max(0, Math.min(newScrollTop, scrollHeight - clientHeight));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartY, dragStartScrollTop, scrollHeight, clientHeight]);

  const thumbHeight = Math.max(30, (clientHeight / scrollHeight) * 100);
  const thumbTop = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * (100 - thumbHeight) : 0;

  const isScrollable = scrollHeight > clientHeight;
  
  // Показывать скроллбар только когда контент действительно скроллится
  const shouldShowScrollbar = isScrollable && scrollHeight > clientHeight + 10;

  return (
    <Box
      sx={{
        position: 'relative',
        height,
        width,
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* Основной контент */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          '&::-webkit-scrollbar': {
            display: 'none', // WebKit
          },
        }}
      >
        {children}
      </Box>

      {/* Кастомный скроллбар */}
      {shouldShowScrollbar && (
        <Box
          ref={scrollbarRef}
          onClick={handleScrollbarClick}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '10px',
            height: '100%',
            backgroundColor: 'rgba(44, 62, 80, 0.3)',
            cursor: 'pointer',
            borderRadius: '5px',
            border: '1px solid rgba(44, 62, 80, 0.5)',
            zIndex: 9999,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(44, 62, 80, 0.5)',
              border: '1px solid rgba(44, 62, 80, 0.7)',
            },
          }}
        >
          {/* Ползунок скроллбара */}
          <Box
            ref={thumbRef}
            onMouseDown={handleThumbMouseDown}
            sx={{
              position: 'absolute',
              right: 0,
              top: `${thumbTop}%`,
              width: '100%',
              height: `${thumbHeight}%`,
              backgroundColor: '#2c3e50',
              borderRadius: '5px',
              cursor: 'grab',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              border: '1px solid #1a252f',
              zIndex: 10000,
              '&:hover': {
                backgroundColor: '#1a252f',
                transform: 'scaleX(1.2)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
              },
              '&:active': {
                cursor: 'grabbing',
                backgroundColor: '#1a252f',
                transform: 'scaleX(1.1)',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default CustomScrollbar;
