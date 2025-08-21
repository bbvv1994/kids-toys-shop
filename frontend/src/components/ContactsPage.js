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
  Email,
  Directions
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import OpenStreetMapComponent from './OpenStreetMap';
import { API_ENDPOINTS } from '../config/api';

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
    
    try {
      const response = await fetch(API_ENDPOINTS.CONTACT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        const result = await response.json();
        alert(result.error || t('contacts.contactForm.error'));
      }
    } catch (error) {
      console.error('Ошибка отправки формы:', error);
      alert(t('contacts.contactForm.errorTryAgain'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(t('contacts.whatsapp.message'));
    window.open(`https://wa.me/972533774509?text=${message}`, '_blank');
  };

  const handleWazeClick = (location, coordinates = null) => {
    if (coordinates) {
      // Используем точные координаты для более точной навигации
      window.open(`https://waze.com/ul?ll=${coordinates.lat},${coordinates.lng}&navigate=yes`, '_blank');
    } else {
      // Fallback на текстовый адрес
      const encodedLocation = encodeURIComponent(location);
      window.open(`https://waze.com/ul?q=${encodedLocation}&navigate=yes`, '_blank');
    }
  };

  // Данные о магазинах для карты
  const stores = [
    {
      name: t('contacts.address.store1.name'),
      address: t('contacts.address.store1.location'),
      phone: t('contacts.phones.primary'),
      coordinates: { lat: 32.835482, lng: 35.063737 } // Kiryat Yam - Robert Sold 8
    },
    {
      name: t('contacts.address.store2.name'),
      address: t('contacts.address.store2.location'),
      phone: t('contacts.phones.secondary'),
      coordinates: { lat: 32.833308, lng: 35.074906 } // Kiryat Motzkin - Weizmann 6
    }
  ];

  const mapCenter = { lat: 32.8344, lng: 35.0693 }; // Центр между магазинами в Хайфском заливе

  return (
    <Container maxWidth="lg" sx={{ 
      py: { xs: 1, md: 6 }, 
      pt: { xs: 4, md: 5.75 }, 
      minHeight: '80vh' 
    }}>
      {/* Заголовок */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 6 } }}>
        <Typography 
          variant="h2" 
          sx={{ 
            textAlign: 'center', 
            mb: { xs: 1, md: 2 },
            fontWeight: 800, 
            color: '#ff6600',
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
            fontSize: { xs: '1.8rem', md: '3rem' },
            textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {t('contacts.title')}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            textAlign: 'center',
            color: '#666', 
            maxWidth: 600, 
            mx: 'auto',
            lineHeight: 1.6,
            fontSize: { xs: '1rem', md: '1.25rem' },
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
          }}
        >
          {t('contacts.subtitle')}
        </Typography>
      </Box>

             {/* Контактные данные */}
       <Grid container spacing={{ xs: 1, md: 4 }} sx={{ mb: { xs: 2, md: 6 }, justifyContent: 'center' }}>
         {/* Адреса магазинов */}
         <Grid item xs={12} sm={6} md={4}>
           <Card sx={{ 
             height: '100%', 
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
             color: 'white',
             maxWidth: { xs: '100%', sm: 'none' },
             mx: { xs: 'auto', sm: 'none' }
           }}>
             <CardContent sx={{ 
               textAlign: 'center', 
               p: { xs: 2, md: 3 },
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center'
             }}>
               <LocationOn sx={{ fontSize: { xs: 40, md: 48 }, mb: 2, color: '#FFD93D' }} />
               <Typography variant="h6" sx={{ 
                 mb: 2, 
                 fontWeight: 700, 
                 fontSize: { xs: '1.1rem', md: '1.25rem' },
                 fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
                 color: 'white'
               }}>
                 {t('contacts.address.title')}
               </Typography>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                 <Box>
                   <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                     {t('contacts.address.store1.name')}
                   </Typography>
                   <Typography variant="body1" sx={{ lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '1rem' } }}>
                     {t('contacts.address.store1.location')}
                   </Typography>
                 </Box>
                 <Box>
                   <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                     {t('contacts.address.store2.name')}
                   </Typography>
                   <Typography variant="body1" sx={{ lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '1rem' } }}>
                     {t('contacts.address.store2.location')}
                   </Typography>
                 </Box>
               </Box>
             </CardContent>
           </Card>
         </Grid>

         {/* Телефоны */}
         <Grid item xs={12} sm={6} md={2}>
           <Card sx={{ 
             height: '100%', 
             background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)', 
             color: 'white',
             maxWidth: { xs: '100%', sm: 'none' },
             mx: { xs: 'auto', sm: 'none' }
           }}>
             <CardContent sx={{ 
               textAlign: 'center', 
               p: { xs: 2, md: 3 },
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center'
             }}>
               <Phone sx={{ fontSize: { xs: 40, md: 48 }, mb: 2, color: '#FFD93D' }} />
               <Typography variant="h6" sx={{ 
                 mb: 2, 
                 fontWeight: 700, 
                 fontSize: { xs: '1.1rem', md: '1.25rem' },
                 fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
                 color: 'white'
               }}>
                 {t('contacts.phones.title')}
               </Typography>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                 <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                   {t('contacts.phones.primary')}
                 </Typography>
                 <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                   {t('contacts.phones.secondary')}
                 </Typography>
               </Box>
             </CardContent>
           </Card>
         </Grid>

         {/* WhatsApp */}
         <Grid item xs={12} sm={6} md={2}>
           <Card sx={{ 
             height: '100%', 
             background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', 
             color: 'white',
             maxWidth: { xs: '100%', sm: 'none' },
             mx: { xs: 'auto', sm: 'none' }
           }}>
             <CardContent sx={{ 
               textAlign: 'center', 
               p: { xs: 2, md: 3 },
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center'
             }}>
               <WhatsApp sx={{ fontSize: { xs: 40, md: 48 }, mb: 2, color: '#FFD93D' }} />
               <Typography variant="h6" sx={{ 
                 mb: 2, 
                 fontWeight: 700, 
                 fontSize: { xs: '1.1rem', md: '1.25rem' },
                 fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
                 color: 'white'
               }}>
                 {t('contacts.whatsapp.title')}
               </Typography>
               <Button
                 variant="contained"
                 onClick={handleWhatsAppClick}
                 sx={{
                   background: '#25D366',
                   color: 'white',
                   fontWeight: 600,
                   fontSize: { xs: '0.8rem', md: '1rem' },
                   px: { xs: 2, md: 3 },
                   py: { xs: 1, md: 1.5 },
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

         {/* Часы работы */}
         <Grid item xs={12} sm={6} md={4}>
           <Card sx={{ 
             height: '100%', 
             background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)',
             maxWidth: { xs: '100%', sm: 'none' },
             mx: { xs: 'auto', sm: 'none' }
           }}>
             <CardContent sx={{ 
               textAlign: 'center', 
               p: { xs: 2, md: 3 },
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center'
             }}>
               <AccessTime sx={{ fontSize: { xs: 40, md: 48 }, mb: 2, color: 'white' }} />
               <Typography variant="h6" sx={{ 
                 mb: 2, 
                 fontWeight: 700, 
                 color: 'white', 
                 fontSize: { xs: '1.1rem', md: '1.25rem' },
                 fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
               }}>
                 {t('contacts.workingHours.title')}
               </Typography>
               <Box sx={{ color: 'white', width: '100%' }}>
                 <Typography variant="body1" sx={{ mb: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                   {t('contacts.workingHours.weekdays')}
                 </Typography>
                 <Typography variant="body1" sx={{ mb: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                   {t('contacts.workingHours.friday')}
                 </Typography>
                 <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                   {t('contacts.workingHours.saturday')}
                 </Typography>
               </Box>
             </CardContent>
           </Card>
         </Grid>
      </Grid>

      {/* Карта и навигация */}
      <Box sx={{ mb: { xs: 3, md: 6 } }}>
        <Typography variant="h5" sx={{ 
          mb: { xs: 2, md: 3 }, 
          fontWeight: 700, 
          textAlign: 'center',
          fontSize: { xs: '1.3rem', md: '1.5rem' },
          fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
          color: '#333'
        }}>
          {t('contacts.map.title')}
        </Typography>
        
        {/* Карта */}
        <Card sx={{ overflow: 'hidden', borderRadius: 3, mb: { xs: 2, md: 4 } }}>
          <OpenStreetMapComponent 
            stores={stores}
            center={mapCenter}
            zoom={12}
          />
        </Card>

        {/* Ссылки на Waze */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={6}>
            <Card sx={{ 
              p: { xs: 2, md: 3 }, 
              background: 'linear-gradient(135deg, #33CCFF 0%, #0066CC 100%)', 
              color: 'white',
              maxWidth: { xs: '100%', sm: 'none' },
              mx: { xs: 'auto', sm: 'none' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
                <img 
                  src="/lion-logo.png..png" 
                  alt="Симба - Король игрушек" 
                  style={{
                    width: '80px',
                    height: '80px',
                    marginRight: '8px',
                    marginBottom: '4px',
                    filter: 'drop-shadow(0 2px 4px rgba(255, 217, 61, 0.3))'
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  {t('contacts.address.store1.name')}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, fontSize: { xs: '0.9rem', md: '1rem' }, textAlign: { xs: 'center', sm: 'left' } }}>
                {t('contacts.address.store1.location')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Button
                  variant="contained"
                  onClick={() => handleWazeClick(t('contacts.address.store1.location'), stores[0].coordinates)}
                  sx={{
                    background: 'linear-gradient(135deg, #87CEEB 0%, #5F9EA0 100%)',
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    px: { xs: 1.5, md: 2 },
                    py: 1.5,
                    height: 44,
                    boxShadow: '0 2px 8px rgba(135, 206, 235, 0.3)',
                    textTransform: 'none',
                    minWidth: { xs: '100%', sm: 140 },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5F9EA0 0%, #87CEEB 100%)',
                      boxShadow: '0 4px 12px rgba(135, 206, 235, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                  }}
                >
                  Открыть в Waze
                </Button>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Card sx={{ 
              p: { xs: 2, md: 3 }, 
              background: 'linear-gradient(135deg, #33CCFF 0%, #0066CC 100%)', 
              color: 'white',
              maxWidth: { xs: '100%', sm: 'none' },
              mx: { xs: 'auto', sm: 'none' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
                <img 
                  src="/lion-logo.png..png" 
                  alt="Симба - Король игрушек" 
                  style={{
                    width: '80px',
                    height: '80px',
                    marginRight: '8px',
                    marginBottom: '4px',
                    filter: 'drop-shadow(0 2px 4px rgba(255, 217, 61, 0.3))'
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  {t('contacts.address.store2.name')}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, fontSize: { xs: '0.9rem', md: '1rem' }, textAlign: { xs: 'center', sm: 'left' } }}>
                {t('contacts.address.store2.location')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Button
                  variant="contained"
                  onClick={() => handleWazeClick(t('contacts.address.store2.location'), stores[1].coordinates)}
                  sx={{
                    background: 'linear-gradient(135deg, #87CEEB 0%, #5F9EA0 100%)',
                    color: '#fff',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 15,
                    px: { xs: 1.5, md: 2 },
                    py: 1.5,
                    height: 44,
                    boxShadow: '0 2px 8px rgba(135, 206, 235, 0.3)',
                    textTransform: 'none',
                    minWidth: { xs: '100%', sm: 140 },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5F9EA0 0%, #87CEEB 100%)',
                      boxShadow: '0 4px 12px rgba(135, 206, 235, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                  }}
                >
                  Открыть в Waze
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Форма обратной связи */}
      <Grid container spacing={{ xs: 3, md: 6 }} sx={{ mb: { xs: 3, md: 6 } }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: { xs: 2, md: 4 }, height: 'fit-content' }}>
            <Typography variant="h5" sx={{ 
              mb: { xs: 2, md: 3 }, 
              fontWeight: 700, 
              color: '#333',
              fontSize: { xs: '1.3rem', md: '1.5rem' },
              fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
            }}>
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
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  color: '#fff',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 15,
                  px: { xs: 2, md: 3 },
                  py: 1.5,
                  height: 44,
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: 160 },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                    transform: 'translateY(-1px)'
                  },
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'flex-end' }}>
              <Typography variant="body1">
                {t('contacts.info.email')}
              </Typography>
              <Email sx={{ color: '#4ECDC4' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'flex-end' }}>
              <Typography variant="body1">
                {t('contacts.info.phone')}
              </Typography>
              <Phone sx={{ color: '#4ECDC4' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
              <Typography variant="body1">
                {t('contacts.info.phone2')}
              </Typography>
              <Phone sx={{ color: '#4ECDC4' }} />
            </Box>
          </Box>
        </Grid>
      </Grid>


    </Container>
  );
} 