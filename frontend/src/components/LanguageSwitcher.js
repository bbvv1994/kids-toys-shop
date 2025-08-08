import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Typography } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'ru', name: 'Русский', display: 'RU' },
    { code: 'he', name: 'עברית', display: 'IL' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  // Find the next language to switch to
  const getNextLanguage = () => {
    const currentIndex = languages.findIndex(lang => lang.code === i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    return languages[nextIndex];
  };

  const handleToggleLanguage = () => {
    const nextLanguage = getNextLanguage();
    i18n.changeLanguage(nextLanguage.code);
  };

  return (
    <IconButton
      onClick={handleToggleLanguage}
      color="inherit"
      sx={{
        minWidth: 0,
        p: 0,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        border: '2px solid #fff',
        borderRadius: '50%',
        width: 40,
        height: 40,
        transition: 'border-color 0.2s',
        '&:hover': {
          borderColor: '#ffe066',
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="body1" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>
        {currentLanguage.display}
      </Typography>
    </IconButton>
  );
};

export default LanguageSwitcher; 