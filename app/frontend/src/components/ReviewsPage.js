import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { getTranslatedName } from '../utils/translationUtils';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import { Star, Send, ArrowBack, Store, ShoppingBag } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const ReviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [shopReview, setShopReview] = useState({ rating: 0, text: '' });
  const [productReviews, setProductReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Получаем данные заказа из URL параметров или localStorage
    const orderId = new URLSearchParams(location.search).get('orderId');
    console.log('URL search params:', location.search);
    console.log('Extracted orderId:', orderId);
    
    if (orderId) {
      loadOrderData(orderId);
    } else {
      console.log('No orderId found in URL');
      setError('ID заказа не найден в URL');
    }
  }, [location]);

  const loadOrderData = async (orderId) => {
    try {
      console.log('Loading order data for orderId:', orderId);
      
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;
      
      console.log('User data:', userData);
      console.log('Token:', token);

      const response = await fetch(`${API_BASE_URL}/api/profile/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const order = await response.json();
        console.log('Order data received:', order);
        setOrderData(order);
        
        // Инициализируем отзывы для каждого товара
        const initialProductReviews = order.items.map(item => ({
          productId: item.productId,
          productName: getTranslatedName(item.product),
          productImage: item.product.imageUrls?.[0] || '',
          rating: 0,
          comment: ''
        }));
        setProductReviews(initialProductReviews);
        
        // Проверяем прогресс заполнения отзывов
        const reviewProgress = localStorage.getItem(`reviewProgress_${orderId}`);
        if (reviewProgress) {
          const progress = JSON.parse(reviewProgress);
          console.log('Review progress found:', progress);
          
          // Если отзыв о магазине уже отправлен, переходим к шагу 1
          if (progress.shopReview) {
            setCurrentStep(1);
            console.log('Shop review already submitted, moving to step 1');
          }
          
          // Если есть отправленные отзывы о товарах, отмечаем их
          if (progress.productReviews && progress.productReviews.length > 0) {
            setProductReviews(prev => prev.map(review => ({
              ...review,
              submitted: progress.productReviews.includes(review.productId)
            })));
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Error loading order:', errorData);
        setError(errorData.error || 'Ошибка загрузки данных заказа');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Ошибка сети при загрузке данных заказа');
    }
  };

  const handleShopReviewChange = (field, value) => {
    setShopReview(prev => ({ ...prev, [field]: value }));
  };

  const handleProductReviewChange = (index, field, value) => {
    setProductReviews(prev => prev.map((review, i) => 
      i === index ? { ...review, [field]: value } : review
    ));
  };

  const handleSubmitShopReview = async () => {
    if (!shopReview.rating || !shopReview.text.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`${API_BASE_URL}/api/reviews/shop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: shopReview.rating,
          text: shopReview.text.trim(),
          orderId: orderData._id
        })
      });

      if (response.ok) {
        // Сохраняем прогресс
        const orderId = orderData._id;
        const progress = JSON.parse(localStorage.getItem(`reviewProgress_${orderId}`) || '{}');
        progress.shopReview = true;
        localStorage.setItem(`reviewProgress_${orderId}`, JSON.stringify(progress));
        
        // Переходим к следующему шагу
        setCurrentStep(1);
        setSuccess('Отзыв о магазине успешно отправлен!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка при отправке отзыва о магазине');
      }
    } catch (err) {
      setError('Ошибка сети при отправке отзыва');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProductReview = async (index) => {
    const review = productReviews[index];
    if (!review.rating || !review.comment.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`${API_BASE_URL}/api/reviews/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: review.productId,
          rating: review.rating,
          text: review.comment.trim(),
          orderId: orderData._id
        })
      });

      if (response.ok) {
        // Сохраняем прогресс
        const orderId = orderData._id;
        const progress = JSON.parse(localStorage.getItem(`reviewProgress_${orderId}`) || '{}');
        if (!progress.productReviews) progress.productReviews = [];
        if (!progress.productReviews.includes(review.productId)) {
          progress.productReviews.push(review.productId);
        }
        localStorage.setItem(`reviewProgress_${orderId}`, JSON.stringify(progress));
        
        // Отмечаем отзыв как отправленный
        setProductReviews(prev => prev.map((r, i) => 
          i === index ? { ...r, submitted: true } : r
        ));
        
        setSuccess(t('reviews.form.successfullySent'));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка при отправке отзыва о товаре');
      }
    } catch (err) {
      setError('Ошибка сети при отправке отзыва');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Отзыв о магазине', icon: <Store /> },
    { label: 'Отзывы о товарах', icon: <ShoppingBag /> }
  ];

  if (!orderData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <CircularProgress />
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profile')}
          sx={{ mr: 2 }}
        >
          Назад в профиль
        </Button>
        <Typography variant="h4" component="h1">
          {t('reviews.page.title')}
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel icon={step.icon}>
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Информация о заказе */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Заказ #{orderData._id.slice(-8)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Дата: {new Date(orderData.createdAt).toLocaleDateString('ru-RU')}
        </Typography>
      </Paper>

      {/* Сообщения */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Шаг 1: Отзыв о магазине */}
      {currentStep === 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Store sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h5">
              {t('reviews.form.shopReview')}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography component="legend" variant="h6" sx={{ mb: 1 }}>
              {t('reviews.form.rating')}
            </Typography>
            <Rating
              value={shopReview.rating}
              onChange={(event, newValue) => {
                handleShopReviewChange('rating', newValue);
              }}
              size="large"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography component="legend" variant="h6" sx={{ mb: 1 }}>
              {t('reviews.form.reviewText')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder={t('reviews.form.shopPlaceholder')}
              value={shopReview.text}
              onChange={(e) => handleShopReviewChange('text', e.target.value)}
            />
          </Box>

          <Button
            variant="contained"
            onClick={handleSubmitShopReview}
            disabled={loading || !shopReview.rating || !shopReview.text.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            fullWidth
          >
            {loading ? t('reviews.form.submitting') : t('reviews.form.submit')}
          </Button>
        </Paper>
      )}

      {/* Шаг 2: Отзывы о товарах */}
      {currentStep === 1 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3 }}>
            {t('reviews.form.productReview')}
          </Typography>
          
          <Grid container spacing={3}>
            {productReviews.map((review, index) => (
              <Grid size={{ xs: 12 }} key={review.productId}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {review.productImage && (
                        <Grid>
                          <CardMedia
                            component="img"
                            image={review.productImage.startsWith('http') ? review.productImage : `${API_BASE_URL}${review.productImage}`}
                            alt={review.productName}
                            sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                          />
                        </Grid>
                      )}
                      <Grid size={{ xs: true }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {review.productName}
                        </Typography>
                        {review.submitted && (
                          <Chip 
                            label="Отзыв отправлен" 
                            color="success" 
                            size="small" 
                            sx={{ mb: 1 }}
                          />
                        )}
                      </Grid>
                    </Grid>

                    {!review.submitted && (
                      <>
                        <Box sx={{ mt: 2, mb: 2 }}>
                          <Typography component="legend" variant="h6" sx={{ mb: 1 }}>
                            {t('reviews.form.rating')}
                          </Typography>
                          <Rating
                            value={review.rating}
                            onChange={(event, newValue) => {
                              handleProductReviewChange(index, 'rating', newValue);
                            }}
                            size="large"
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography component="legend" variant="h6" sx={{ mb: 1 }}>
                            {t('reviews.form.reviewText')}
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            placeholder={t('reviews.form.productPlaceholder')}
                            value={review.comment}
                            onChange={(e) => handleProductReviewChange(index, 'comment', e.target.value)}
                          />
                        </Box>

                        <Button
                          variant="contained"
                          onClick={() => handleSubmitProductReview(index)}
                          disabled={loading || !review.rating || !review.comment.trim()}
                          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                          fullWidth
                        >
                          {loading ? t('reviews.form.submitting') : t('reviews.form.submit')}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ReviewPage; 