import React, { useState, useEffect } from 'react';
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
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';

const CustomerReviews = () => {
  const { t, i18n } = useTranslation();
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
        setReviews(data);
      } else {
        setError(t('reviews.customerReviews.loadError'));
      }
    } catch (err) {
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
    <Box sx={{ p: 2, width: '100%', mx: 'auto', mt: 10, display: 'flex', justifyContent: 'center' }}>
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
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" component="h3">
                              {review.user?.name || t('reviews.customerReviews.anonymousUser')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
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
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CustomerReviews; 