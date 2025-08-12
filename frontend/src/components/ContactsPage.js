import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  TextField, 
  Button, 
  Chip,
  IconButton
} from '@mui/material';
import { 
  Phone, 
  LocationOn, 
  WhatsApp, 
  AccessTime,
  Send,
  Email
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function ContactsPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Здесь будет логика отправки формы
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 1000);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(t('contacts.whatsapp.message'));
    window.open(`https://wa.me/972533774509?text=${message}`, '_blank');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6, minHeight: '80vh' }}>
      {/* Заголовок */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          {t('contacts.title')}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#666', 
            maxWidth: 600, 
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          {t('contacts.subtitle')}
        </Typography>
      </Box>

      {/* Контактные данные */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Адрес */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <LocationOn sx={{ fontSize: 48, mb: 2, color: '#FFD93D' }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t('contacts.address.title')}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {t('contacts.address.location')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Телефоны */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Phone sx={{ fontSize: 48, mb: 2, color: '#FFD93D' }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t('contacts.phones.title')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {t('contacts.phones.primary')}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {t('contacts.phones.secondary')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* WhatsApp */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <WhatsApp sx={{ fontSize: 48, mb: 2, color: '#FFD93D' }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t('contacts.whatsapp.title')}
              </Typography>
              <Button
                variant="contained"
                onClick={handleWhatsAppClick}
                sx={{
                  background: '#25D366',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    background: '#128C7E'
                  }
                }}
              >
                {t('contacts.whatsapp.button')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Часы работы */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Card sx={{ maxWidth: 400, mx: 'auto', background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <AccessTime sx={{ fontSize: 32, mr: 2, color: 'white' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                {t('contacts.workingHours.title')}
              </Typography>
            </Box>
            <Box sx={{ color: 'white' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {t('contacts.workingHours.weekdays')}
              </Typography>
              <Typography variant="body1">
                {t('contacts.workingHours.weekend')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Форма обратной связи */}
      <Grid container spacing={6} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 4, height: 'fit-content' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
              {t('contacts.contactForm.title')}
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label={t('contacts.contactForm.name')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label={t('contacts.contactForm.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label={t('contacts.contactForm.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label={t('contacts.contactForm.message')}
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                multiline
                rows={4}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={<Send />}
                sx={{
                  background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #44A08D 0%, #4ECDC4 100%)'
                  }
                }}
              >
                {isSubmitting ? t('contacts.contactForm.submitting') : t('contacts.contactForm.submit')}
              </Button>
            </Box>
            {submitSuccess && (
              <Chip
                label={t('contacts.contactForm.success')}
                color="success"
                sx={{ mt: 2 }}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ p: 3, background: '#f8f9fa', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
              {t('contacts.info.title')}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 3 }}>
              {t('contacts.info.description')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Email sx={{ color: '#4ECDC4' }} />
              <Typography variant="body1">
                {t('contacts.info.email')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Phone sx={{ color: '#4ECDC4' }} />
              <Typography variant="body1">
                {t('contacts.info.phone')}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Карта */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
          {t('contacts.map.title')}
        </Typography>
        <Card sx={{ overflow: 'hidden', borderRadius: 3 }}>
          <Box sx={{ height: 400, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ color: '#666' }}>
              {t('contacts.map.placeholder')}
            </Typography>
          </Box>
        </Card>
      </Box>
    </Container>
  );
} 