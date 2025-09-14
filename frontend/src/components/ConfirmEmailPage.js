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
import { useUser } from '../contexts/UserContext';

// === Страница подтверждения email ===
function ConfirmEmailPage() {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { handleLogin } = useUser();
  
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Некорректная ссылка подтверждения');
        return;
      }
  
      // Отправляем запрос на подтверждение
      fetch(`${API_BASE_URL}/api/auth/confirm?token=${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            setStatus('success');
            setMessage(data.message);
            
            // Если есть токен и данные пользователя, автоматически входим в аккаунт
            if (data.token && data.user) {
              // Сохраняем токен в localStorage
              localStorage.setItem('token', data.token);
              
              // Создаем объект пользователя с токеном
              const userData = { ...data.user, token: data.token };
              
              // Обновляем состояние приложения через UserContext
              handleLogin(userData);
              
              // Перенаправляем на главную через 2 секунды
              setTimeout(() => {
                navigate('/');
              }, 2000);
            } else {
              // Если нет токена, просто перенаправляем
              setTimeout(() => navigate('/'), 3000);
            }
          } else {
            setStatus('error');
            setMessage(data.error || 'Ошибка подтверждения');
          }
        })
        .catch(error => {
          console.error('Confirm email error:', error);
          setStatus('error');
          setMessage('Ошибка подтверждения email');
        });
    }, [navigate, location]);
  
    return (
      <Container maxWidth="sm" sx={{ mt: 16, textAlign: 'center' }}>
        <Box sx={{ 
          p: 4, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          background: 'white'
        }}>
          {status === 'loading' && (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">Подтверждение email...</Typography>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                Email подтверждён!
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
                Ошибка подтверждения
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {message}
              </Typography>
              <Button 
                onClick={() => {
                  navigate('/');
                  if (window.location.pathname === '/checkout') {
                    setTimeout(() => window.location.reload(), 100);
                  }
                }}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                  minWidth: 120,
                  height: 44,
                  mr: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                На главную
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                sx={{
                  background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                  minWidth: 120,
                  height: 44,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Попробовать снова
              </Button>
            </>
          )}
        </Box>
      </Container>
    );
  }

export default ConfirmEmailPage;