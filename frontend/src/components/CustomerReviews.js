import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Typography,
  Grid,
  Rating,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Store, Star } from '@mui/icons-material';
import { API_BASE_URL, FRONTEND_URL } from '../config';
import { useTranslation } from 'react-i18next';

const CustomerReviews = () => {
  const { t, i18n } = useTranslation();
  const isHebrew = i18n.language === 'he';
  const runtimeBaseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : '';
  const siteUrl = (FRONTEND_URL || runtimeBaseUrl || 'https://simba-tzatzuim.co.il').replace(/\/+$/, '');
  const canonicalUrl = `${siteUrl}/reviews`;
  const seoTitle = isHebrew
    ? 'ביקורות לקוחות | סימבה מלך הצעצועים בקריית ים ובקריות'
    : 'Отзывы клиентов | Симба - Король игрушек в Кирьят-Яме и Крайот';
  const seoDescription = isHebrew
    ? 'ביקורות של לקוחות על סימבה מלך הצעצועים. איכות צעצועים ושירות בקריית ים והקריות.'
    : 'Читайте отзывы клиентов о Симба - Король игрушек. Качество детских игрушек и сервис в Кирьят-Яме и Крайот.';

  useEffect(() => {
    document.title = seoTitle;
    let canonicalEl = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      canonicalEl.setAttribute('data-manual-canonical', 'true');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);
  }, [canonicalUrl, seoTitle]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/shop/published`);
      
      if (response.ok) {
        const data = await response.json();
        setReviews(Array.isArray(data) ? data : []);
        setError(''); // Очищаем ошибку, если запрос успешен
      } else {
        // Не показываем ошибку, если просто отзывов нет (404 или пустой ответ)
        if (response.status === 404) {
          setReviews([]);
          setError('');
        } else {
          setError(t('reviews.customerReviews.loadError'));
        }
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(t('reviews.customerReviews.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const currentLanguage = i18n.language;
    
    if (currentLanguage === 'he') {
      // Для иврита - цифровой формат (DD.MM.YYYY)
      return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } else {
      // Для русского - текстовый формат
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={isHebrew ? 'he_IL' : 'ru_RU'} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Box sx={{ p: 2, width: '100%', mx: 'auto', mt: 3.75, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, justifyContent: 'center' }}>
          <Store color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5', textAlign: 'center' }}>
              {t('reviews.customerReviews.title')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ width: '100%', maxWidth: '1200px' }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : reviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                {t('reviews.customerReviews.noReviews')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('reviews.customerReviews.beFirst')}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Список отзывов */}
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#3f51b5', textAlign: 'center' }}>
                  {t('reviews.customerReviews.reviewsList')}
                </Typography>
                <List sx={{ width: '100%', maxWidth: '1200px' }}>
                  {reviews.map((review) => (
                    <ListItem 
                      key={review.id}
                      sx={{ 
                        mb: 2, 
                        border: '1px solid #e0e0e0', 
                        borderRadius: 2,
                        backgroundColor: 'white',
                        px: 4,
                        py: 3,
                        width: '100%',
                        maxWidth: '1200px'
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="h3">
                            {review.user?.name || t('reviews.customerReviews.anonymousUser')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating
                            value={review.rating}
                            readOnly
                            icon={<Star fontSize="inherit" sx={{ color: '#FFD700' }} />}
                            emptyIcon={<Star fontSize="inherit" sx={{ color: '#ccc' }} />}
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2">
                            {review.rating}/5
                          </Typography>
                        </Box>
                        {review.text && (
                          <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.6 }}>
                            "{review.text}"
                          </Typography>
                        )}
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(review.createdAt)}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}
        </Box>
        </Box>
      </Box>
    </>
  );
};

export default CustomerReviews; 