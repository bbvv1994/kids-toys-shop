import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, IconButton, Divider, Link, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const API_URL = `${API_BASE_URL}/api/auth`;

function ForgotPasswordDialog({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const dialogContentRef = useRef(null);

  // Блокировка прокрутки фона
  useEffect(() => {
    if (open) {
      // Блокируем прокрутку body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // Добавляем обработчик для предотвращения прокрутки фона
      const preventScroll = (e) => {
        if (dialogContentRef.current?.contains(e.target)) {
          return; // Разрешаем прокрутку внутри модального окна
        }
        
        e.preventDefault();
        e.stopPropagation();
      };
      
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
      };
    } else {
      // Восстанавливаем прокрутку
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      // Очистка при размонтировании
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      const res = await fetch(`${API_URL}/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      setInfo('Если email зарегистрирован, письмо отправлено');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth disableScrollLock={false}>
      <DialogTitle>Восстановление пароля</DialogTitle>
      <DialogContent
        ref={dialogContentRef}
        onWheel={(e) => {
          // Разрешаем прокрутку только внутри DialogContent
          e.stopPropagation();
        }}
      >
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 2, textAlign: 'center', lineHeight: 1.5 }}
          >
            Введите email, привязанный к вашему аккаунту. Мы отправим инструкции для восстановления пароля на указанный адрес.
          </Typography>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="email"
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          {info && <Typography color="primary" sx={{ mt: 1 }}>{info}</Typography>}
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ 
              mt: 2,
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 15,
              py: 1.5,
              height: 44,
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                transform: 'translateY(-1px)'
              },
            }}
          >
            Восстановить
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            color: '#fff',
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 15,
            px: 3,
            py: 1.5,
            height: 44,
            boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
            textTransform: 'none',
            minWidth: 120,
            '&:hover': {
              background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
              transform: 'translateY(-1px)'
            },
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AuthModal({ open, onClose, onLogin, onRegister, loading }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dialogContentRef = useRef(null);

  // Блокировка прокрутки фона
  useEffect(() => {
    if (open) {
      // Блокируем прокрутку body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // Добавляем обработчик для предотвращения прокрутки фона
      const preventScroll = (e) => {
        if (dialogContentRef.current?.contains(e.target)) {
          return; // Разрешаем прокрутку внутри модального окна
        }
        
        e.preventDefault();
        e.stopPropagation();
      };
      
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
      };
    } else {
      // Восстанавливаем прокрутку
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      // Очистка при размонтировании
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [open]);

  const handleSwitch = () => {
    setIsLogin(!isLogin);
    setError('');
    setInfo('');
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    try {
      const res = await fetch(`${API_URL}/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: isLogin ? undefined : name })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      if (isLogin) {
        // Сохраняем объект пользователя из ответа с токеном
        const userData = {
          ...data.user,
          token: data.token
        };
        localStorage.setItem('user', JSON.stringify(userData));

        onLogin && onLogin(userData);
        // Закрываем диалоговое окно после успешного входа
        onClose();
      } else {
        // Показываем сообщение от сервера или стандартное
        const message = data.message || 'Регистрация успешна! Пожалуйста, подтвердите email перед входом в систему.';
        setInfo(message);
        
        // Передаем данные пользователя для модального окна подтверждения
        const userData = {
          email: email,
          name: name,
          ...data.user // Добавляем данные от сервера, если они есть
        };
        onRegister && onRegister(userData);
      }
    } catch (e) {
      console.error('Auth error:', e);
      
      // Проверяем специальные ошибки
      if (e.message.includes('зарегистрирован через Google')) {
        setError('Этот аккаунт зарегистрирован через Google. Пожалуйста, используйте кнопку "Войти через Google" для входа.');
      } else {
        setError(e.message);
      }
    }
  };

  const handleOAuth = (provider) => {

    // Используем window.location.href для полного перенаправления
    window.location.href = `${API_URL}/${provider}`;
  };

  return (
    <>
      <Dialog 
        open={open && !forgotOpen} 
        onClose={onClose} 
        maxWidth="xs" 
        fullWidth 
        disableScrollLock={false}
        sx={{ zIndex: 9999 }}
      >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isLogin ? 'Вход' : 'Регистрация'}
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent
        ref={dialogContentRef}
        onWheel={(e) => {
          // Разрешаем прокрутку только внутри DialogContent
          e.stopPropagation();
        }}
      >
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {!isLogin && (
            <TextField
              label="Имя"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
              autoFocus
              autoComplete="name"
            />
          )}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="email"
          />
          <TextField
            label="Пароль"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      }
                    }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {isLogin && (
            <Box sx={{ mt: 1, textAlign: 'right' }}>
              <Link 
                component="button" 
                type="button"
                variant="body2" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setForgotOpen(true);
                }}
              >
                Забыли пароль?
              </Link>
            </Box>
          )}
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          {info && <Typography color="primary" sx={{ mt: 1 }}>{info}</Typography>}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ 
              mt: 2,
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 15,
              py: 1.5,
              height: 44,
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                transform: 'translateY(-1px)'
              },
            }}
            disabled={loading}
          >
            {isLogin ? (loading ? 'Вход...' : 'Войти') : (loading ? 'Регистрация...' : 'Зарегистрироваться')}
          </Button>
        </Box>
        <Divider sx={{ my: 2 }}>или</Divider>
        <Button
          variant="contained"
          fullWidth
          sx={{ 
            mb: 1, 
            textTransform: 'none',
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: '#fff',
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 15,
            py: 1.5,
            height: 44,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
              transform: 'translateY(-1px)'
            },
          }}
          onClick={() => handleOAuth('google')}
          disabled={loading}
        >
          Войти через Google
        </Button>
        <Button
          variant="contained"
          fullWidth
          sx={{ 
            textTransform: 'none',
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: '#fff',
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 15,
            py: 1.5,
            height: 44,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
              transform: 'translateY(-1px)'
            },
          }}
          onClick={() => handleOAuth('facebook')}
          disabled={loading}
        >
          Войти через Facebook
        </Button>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            onClick={handleSwitch} 
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 14,
              px: 2,
              py: 1,
              boxShadow: '0 2px 8px rgba(255, 102, 0, 0.3)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #ff8533 0%, #ff6600 100%)',
                boxShadow: '0 4px 12px rgba(255, 102, 0, 0.4)',
                transform: 'translateY(-1px)'
              },
            }}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
    <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
} 