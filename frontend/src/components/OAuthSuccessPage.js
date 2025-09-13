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

// === Страница успешной OAuth авторизации ===
function OAuthSuccessPage() {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
  
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Некорректная ссылка авторизации');
        return;
      }
  
      // Декодируем JWT токен для получения данных пользователя
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
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
        setMessage('Авторизация через Google успешна!');
        
        // Перенаправляем на главную через 2 секунды
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        console.error('OAuth success error:', error);
        setStatus('error');
        setMessage('Ошибка обработки токена авторизации');
      }
    }, [navigate, location]);
  
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
              <Typography variant="h6">Обработка авторизации...</Typography>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                Авторизация успешна!
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {message}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Вы автоматически войдёте в аккаунт и будете перенаправлены на главную страницу...
              </Typography>
            </>
          )}
          {status === 'error' && (
            <>
              <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" color="error.main" sx={{ mb: 2 }}>
                Ошибка авторизации
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => {
                  navigate('/');
                  if (window.location.pathname === '/checkout') {
                    setTimeout(() => window.location.reload(), 100);
                  }
                }}
                sx={{ mr: 2 }}
              >
                На главную
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
              >
                Попробовать снова
              </Button>
            </>
          )}
        </Box>
      </Container>
    );
  }

export default OAuthSuccessPage;