import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';

// === Страница успешной OAuth авторизации ===
function OAuthSuccessPage() {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
  
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage(t('auth.oauthError.message', { error: 'Token not found' }));
        return;
      }
  
      // Декодируем JWT токен для получения данных пользователя
      try {
        // Проверяем, что токен имеет правильный формат JWT
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT token format');
        }
        
        // Безопасное декодирование JWT токена
        const base64Url = tokenParts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        // Добавляем padding если необходимо
        const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
        
        // Декодируем payload JWT как UTF-8, чтобы имена с ивритом/русским не искажались
        let payload;
        try {
          // Проверяем, что строка содержит только валидные base64 символы
          const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
          if (!base64Regex.test(paddedBase64)) {
            throw new Error('Invalid base64 characters in JWT token');
          }
          
          const binary = atob(paddedBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          if (typeof TextDecoder !== 'undefined') {
            const decoder = new TextDecoder('utf-8');
            const jsonString = decoder.decode(bytes);
            payload = JSON.parse(jsonString);
          } else {
            // Фолбэк для старых браузеров
            const jsonString = decodeURIComponent(escape(binary));
            payload = JSON.parse(jsonString);
          }
        } catch (utf8Error) {
          console.error('JWT decode error:', utf8Error);
          console.error('Problematic base64 string:', paddedBase64);
          
          // В крайнем случае используем стандартный путь
          try {
            payload = JSON.parse(atob(paddedBase64));
          } catch (fallbackError) {
            console.error('JWT fallback decode error:', fallbackError);
            throw new Error('Failed to decode JWT token: ' + utf8Error.message);
          }
        }
        
        // Дополнительное декодирование имени пользователя
        let userName = payload.name;
        
        if (userName) {
          try {
            // Проверяем, нужно ли декодировать
            let decoded = userName;
            
            // Если имя содержит %XX кодировку, декодируем
            if (userName.includes('%')) {
              decoded = decodeURIComponent(userName);
            }
            
            // Если результат содержит еще %XX, декодируем еще раз
            if (decoded.includes('%')) {
              decoded = decodeURIComponent(decoded);
            }
            
            // Очищаем и нормализуем имя
            userName = decoded.trim().replace(/\s+/g, ' ') || userName;
          } catch (error) {
            console.error('Error decoding user name on frontend:', error);
            // В случае ошибки оставляем оригинальное имя
          }
        }
        
        const userData = {
          id: payload.userId,
          email: payload.email,
          name: userName,
          role: payload.role,
          token: token,
          emailVerified: true
        };
        
        // Сохраняем данные пользователя
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        // Обновляем состояние приложения
        if (window.setUser) {
          window.setUser(userData);
        }
        
        setStatus('success');
        setMessage(t('auth.loginSuccess'));
        
        // Перенаправляем на главную через 2 секунды
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        console.error('OAuth success error:', error);
        console.error('Token that caused error:', token);
        setStatus('error');
        setMessage(t('auth.oauthError.message', { error: error.message }));
      }
    }, [navigate, location, t]);
  
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Box sx={{ 
          p: 4, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          background: 'white'
        }}>
          {status === 'loading' && (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">{t('common.loading')}</Typography>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                {t('auth.loginSuccess')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {message}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.oauthSuccess.redirectMessage')}
              </Typography>
            </>
          )}
          {status === 'error' && (
            <>
              <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" color="error.main" sx={{ mb: 2 }}>
                {t('auth.oauthError.title')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                {message}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="contained"
                  onClick={() => {
                    navigate('/');
                    if (window.location.pathname === '/checkout') {
                      setTimeout(() => window.location.reload(), 100);
                    }
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    px: 3,
                    py: 1.5,
                    height: 44,
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                    textTransform: 'none',
                    minWidth: 140,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                  }}
                >
                  {t('auth.oauthError.goHome')}
                </Button>
                <Button 
                  variant="contained"
                  onClick={() => window.location.reload()}
                  sx={{
                    background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    px: 3,
                    py: 1.5,
                    height: 44,
                    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                    textTransform: 'none',
                    minWidth: 140,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                  }}
                >
                  {t('auth.oauthError.tryAgain')}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Container>
    );
  }

export default OAuthSuccessPage;