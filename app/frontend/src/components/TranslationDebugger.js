import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import { getTranslatedName, checkTranslationsAvailable, forceLanguageUpdate } from '../utils/translationUtils';

const TranslationDebugger = ({ product }) => {
  const { t, i18n } = useTranslation();
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(process.env.NODE_ENV === 'production');

  useEffect(() => {
    const updateDebugInfo = () => {
      const info = {
        currentLanguage: i18n.language,
        availableLanguages: i18n.languages,
        hasResources: i18n.hasResourceBundle(i18n.language, 'translation'),
        localStorage: localStorage.getItem('i18nextLng'),
        productName: product?.name,
        productNameHe: product?.nameHe,
        translatedName: getTranslatedName(product),
        translationsAvailable: checkTranslationsAvailable(),
        isInitialized: i18n.isInitialized,
        ready: i18n.isLanguageChangingTo,
        changeLanguage: i18n.changeLanguage,
        t: typeof t,
        environment: process.env.NODE_ENV,
        userAgent: navigator.userAgent,
        hostname: window.location.hostname
      };
      setDebugInfo(info);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000);
    return () => clearInterval(interval);
  }, [i18n, product, t]);

  const handleForceRussian = () => {
    forceLanguageUpdate('ru');
  };

  const handleForceHebrew = () => {
    forceLanguageUpdate('he');
  };

  if (!showDebug) {
    return (
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        <Button 
          variant="contained" 
          color="warning" 
          size="small"
          onClick={() => setShowDebug(true)}
        >
          Debug Translations
        </Button>
      </Box>
    );
  }

  return (
    <Paper sx={{ 
      position: 'fixed', 
      top: 20, 
      right: 20, 
      width: 400, 
      maxHeight: '80vh', 
      overflow: 'auto', 
      zIndex: 9999,
      p: 2,
      backgroundColor: '#fff',
      border: '2px solid #ff9800'
    }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#ff9800' }}>
        🔧 Translation Debugger
      </Typography>
      
      <Button 
        variant="outlined" 
        size="small" 
        onClick={() => setShowDebug(false)}
        sx={{ mb: 2 }}
      >
        Close
      </Button>

      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          size="small" 
          onClick={handleForceRussian}
          sx={{ mr: 1 }}
        >
          Force Russian
        </Button>
        <Button 
          variant="contained" 
          size="small" 
          onClick={handleForceHebrew}
        >
          Force Hebrew
        </Button>
      </Box>

      {debugInfo.translationsAvailable ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ Translations Available
        </Alert>
      ) : (
        <Alert severity="error" sx={{ mb: 2 }}>
          ❌ Translations NOT Available
        </Alert>
      )}

      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
        <strong>Current Language:</strong> {debugInfo.currentLanguage}<br/>
        <strong>Available Languages:</strong> {debugInfo.availableLanguages?.join(', ')}<br/>
        <strong>Has Resources:</strong> {debugInfo.hasResources ? '✅' : '❌'}<br/>
        <strong>LocalStorage:</strong> {debugInfo.localStorage || 'null'}<br/>
        <strong>Is Initialized:</strong> {debugInfo.isInitialized ? '✅' : '❌'}<br/>
        <strong>Environment:</strong> {debugInfo.environment}<br/>
        <strong>Hostname:</strong> {debugInfo.hostname}<br/>
        <br/>
        <strong>Product Name (RU):</strong> {debugInfo.productName}<br/>
        <strong>Product Name (HE):</strong> {debugInfo.productNameHe || 'null'}<br/>
        <strong>Translated Name:</strong> {debugInfo.translatedName}<br/>
        <br/>
        <strong>Function t:</strong> {debugInfo.t}<br/>
        <strong>Change Language:</strong> {typeof debugInfo.changeLanguage}<br/>
      </Typography>
    </Paper>
  );
};

export default TranslationDebugger;
