import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // 'success', 'error', ''
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setStatus('');
      setMessage('');
    } else {
      setStatus('error');
      setMessage(t('auth.resetPasswordInvalidLink'));
    }
    setIsInitializing(false);
  }, [searchParams, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setStatus('error');
      setMessage(t('auth.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        const displayMessage = data.message.startsWith('auth.') ? t(data.message) : data.message;
        setMessage(displayMessage);
        
        // Перенаправляем на главную страницу через 3 секунды
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setStatus('error');
        const displayError = data.error.startsWith('auth.') ? t(data.error) : data.error;
        setMessage(displayError);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setStatus('error');
      setMessage(t('auth.resetPasswordError'));
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (isInitializing) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center">
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">
              {t('auth.loading')}
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center">
            <Lock sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              {t('auth.resetPasswordInvalidLink')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('auth.resetPasswordInvalidLinkDescription')}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              {t('common.goToHome')}
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" sx={{ mb: 4 }}>
          <Lock sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {t('auth.resetPassword')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('auth.resetPasswordDescription')}
          </Typography>
        </Box>

        {message && (
          <Alert 
            severity={status === 'success' ? 'success' : 'error'} 
            sx={{ mb: 3 }}
          >
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('auth.newPassword')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label={t('auth.confirmNewPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('auth.resetPassword')
            )}
          </Button>

          {status === 'success' && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {t('auth.resetPasswordRedirect')}
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;
