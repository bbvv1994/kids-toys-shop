import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!show) return null;

  return (
    <Box
      onClick={handleScrollTop}
      sx={{
        position: 'fixed',
        right: { xs: 16, md: 32 },
        bottom: { xs: 24, md: 40 },
        zIndex: 1500,
        bgcolor: '#fff',
        border: '2px solid #ff6600',
        borderRadius: '50%',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        width: 52,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s, box-shadow 0.2s',
        '&:hover': {
          bgcolor: '#fff7f0',
          boxShadow: '0 8px 24px rgba(255,102,0,0.12)',
        },
      }}
      title="Наверх"
    >
      <KeyboardArrowUpIcon sx={{ color: '#ff6600', fontSize: 36 }} />
    </Box>
  );
} 