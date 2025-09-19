import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL, getImageUrl } from '../config';
import { getTranslatedName } from '../utils/translationUtils';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Paper,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Star, Send, ArrowBack, Store, ShoppingBag } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const ReviewPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [shopReview, setShopReview] = useState({ rating: 0, text: '' });
  const [productReviews, setProductReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);

  const loadOrderData = useCallback(async (orderId) => {
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
        const initialProductReviews = order.items.map(item => {
          return {
            productId: item.productId,
            product: item.product, // Сохраняем полный объект товара
            productImage: item.product.imageUrls?.[0] || '/photography.jpg',
            rating: 0,
            comment: ''
          };
        });
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
            console.log('Product reviews progress loaded:', progress.productReviews);
          }
        }
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError(t('reviews.form.loadOrderErrorWithStatus', { status: response.status }));
      }
    } catch (err) {
      console.error('Error loading order data:', err);
      setError(t('reviews.form.loadOrderError'));
    }
  }, [t]);

  useEffect(() => {
    // Получаем данные заказа из URL параметров или localStorage
    const orderId = new URLSearchParams(location.search).get('orderId');
    console.log('URL search params:', location.search);
    console.log('Extracted orderId:', orderId);
    
    if (orderId) {
      loadOrderData(orderId);
    } else {
      console.log('No orderId found in URL');
      setError(t('reviews.form.orderIdNotFound'));
    }
  }, [location, loadOrderData, t]);







  const handleShopReviewChange = (field, value) => {
    setShopReview(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleProductReviewChange = (index, field, value) => {
    setProductReviews(prev => prev.map((review, i) => 
      i === index ? { ...review, [field]: value } : review
    ));
    setError('');
  };

  const handleSubmitShopReview = async () => {
    // Проверяем, не был ли уже отправлен отзыв о магазине
    const reviewProgress = localStorage.getItem(`reviewProgress_${orderData.id}`);
    if (reviewProgress) {
      const progress = JSON.parse(reviewProgress);
      if (progress.shopReview) {
        setError(t('reviews.form.shopReviewAlreadySubmitted'));
        return;
      }
    }
    
    if (shopReview.rating === 0) {
      setError('Пожалуйста, поставьте оценку магазину');
      return;
    }

    if (!shopReview.text.trim()) {
              setError(t('reviews.form.pleaseWriteShopReview'));
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
          orderId: orderData.id, // Добавляем orderId
          rating: shopReview.rating,
          text: shopReview.text
        })
      });

      if (response.ok) {
        // Сохраняем прогресс заполнения отзывов
        const reviewProgress = {
          shopReview: true,
          productReviews: [],
          totalProducts: productReviews.length
        };
        localStorage.setItem(`reviewProgress_${orderData.id}`, JSON.stringify(reviewProgress));
        
        // Если нет товаров для отзыва, сохраняем информацию о отправленном отзыве
        if (productReviews.length === 0) {
          const submittedReviewsData = localStorage.getItem('submittedReviews');
          let submittedReviews = submittedReviewsData ? JSON.parse(submittedReviewsData) : [];
          if (!submittedReviews.includes(orderData.id)) {
            submittedReviews.push(orderData.id);
            localStorage.setItem('submittedReviews', JSON.stringify(submittedReviews));
          }
          
          // Немедленно обновляем счетчик уведомлений
          const event = new CustomEvent('updateNotificationsCount');
          window.dispatchEvent(event);
        }
        
        setCurrentStep(1);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || t('reviews.form.submitError'));
      }
    } catch (err) {
      setError(t('common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProductReview = async (index) => {
    const review = productReviews[index];
    
    // Проверяем, не был ли уже отправлен отзыв о товаре
    if (review.submitted) {
              setError(t('reviews.form.alreadySubmitted'));
      return;
    }
    
    if (review.rating === 0) {
      setError('Пожалуйста, поставьте оценку товару');
      return;
    }

    if (!review.comment.trim()) {
              setError(t('reviews.form.pleaseWriteReview'));
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
          orderId: orderData.id, // Добавляем orderId
          productId: review.productId,
          rating: review.rating,
          text: review.comment // Используем 'text' вместо 'comment'
        })
      });

      if (response.ok) {
        // Отмечаем отзыв как отправленный
        setProductReviews(prev => prev.map((r, i) => 
          i === index ? { ...r, submitted: true } : r
        ));
        setError('');
        
        // Обновляем прогресс заполнения отзывов
        const existingProgress = localStorage.getItem(`reviewProgress_${orderData.id}`);
        let reviewProgress = existingProgress ? JSON.parse(existingProgress) : {
          shopReview: false,
          productReviews: [],
          totalProducts: productReviews.length
        };
        
        // Добавляем отправленный отзыв о товаре
        if (!reviewProgress.productReviews.includes(review.productId)) {
          reviewProgress.productReviews.push(review.productId);
        }
        
        localStorage.setItem(`reviewProgress_${orderData.id}`, JSON.stringify(reviewProgress));
        
        // Проверяем, все ли отзывы отправлены
        const allSubmitted = productReviews.every((r, i) => 
          i === index ? true : r.submitted
        );
        
        if (allSubmitted) {
          // Сохраняем информацию о отправленном отзыве в localStorage
          const submittedReviewsData = localStorage.getItem('submittedReviews');
          let submittedReviews = submittedReviewsData ? JSON.parse(submittedReviewsData) : [];
          if (!submittedReviews.includes(orderData.id)) {
            submittedReviews.push(orderData.id);
            localStorage.setItem('submittedReviews', JSON.stringify(submittedReviews));
          }
          
          // Немедленно обновляем счетчик уведомлений
          const event = new CustomEvent('updateNotificationsCount');
          window.dispatchEvent(event);
          
          setSuccess(true);
          setTimeout(() => {
            navigate('/profile');
          }, 2000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || t('reviews.form.submitError'));
      }
    } catch (err) {
      setError(t('common.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

      const steps = [t('reviews.form.shopReviewStep'), t('reviews.form.productReviewsStep')];

  if (!orderData) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 12 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              {t('reviews.modal.title')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/profile')}
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
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                  transform: 'translateY(-1px)'
                },
              }}
            >
              {t('reviews.form.back')}
            </Button>
          </Box>

          {error ? (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('reviews.form.loadingOrderData')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('reviews.form.pleaseWait')}
              </Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                {t('reviews.form.failedToLoadOrder')}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {t('reviews.form.linkExpiredOrOrderNotFound')}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/profile')}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  px: 3,
                  py: 1.5,
                  height: 44,
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                  textTransform: 'none',
                  minWidth: 120,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                }}
              >
                {t('reviews.form.returnToProfile')}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 12 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              {t('reviews.modal.title')} #{orderData.id}
            </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/profile')}
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
              minWidth: 120,
              '&:hover': {
                background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                transform: 'translateY(-1px)'
              },
            }}
          >
            {t('reviews.form.back')}
          </Button>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {t('reviews.form.allReviewsSuccessfullySent')}
          </Alert>
        )}

        {/* Шаг 1: Отзыв о магазине */}
        {currentStep === 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Store color="primary" />
              {t('reviews.form.shopReviewStep')}
            </Typography>

            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography component="legend" sx={{ mb: 1 }}>{t('reviews.form.shopRatingLabel')}</Typography>
              <Rating
                name="shop-rating"
                value={shopReview.rating}
                onChange={(event, newValue) => handleShopReviewChange('rating', newValue)}
                precision={1}
                icon={<Star fontSize="inherit" sx={{ color: '#FFD700' }} />}
                emptyIcon={<Star fontSize="inherit" sx={{ color: '#ccc' }} />}
                sx={{ fontSize: '2.5rem' }}
              />
            </Box>

            <TextField
              label={t('reviews.form.shopReviewLabel')}
              multiline
              rows={4}
              fullWidth
              value={shopReview.text}
              onChange={(e) => handleShopReviewChange('text', e.target.value)}
              variant="outlined"
              placeholder={t('reviews.form.shopReviewPlaceholder')}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmitShopReview}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
              sx={{ 
                py: 1.5, 
                borderRadius: 2, 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#fff',
                fontSize: 15,
                height: 44,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#ccc',
                  boxShadow: 'none',
                  transform: 'none'
                }
              }}
            >
              {loading ? t('reviews.form.submitting') : t('reviews.form.submitShopReview')}
            </Button>
            
            {/* Показываем сообщение, если отзыв уже отправлен */}
            {(() => {
              const reviewProgress = localStorage.getItem(`reviewProgress_${orderData?.id}`);
              if (reviewProgress) {
                const progress = JSON.parse(reviewProgress);
                if (progress.shopReview) {
                  return (
                                          <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                        {t('reviews.form.shopReviewSubmitted')}
                      </Alert>
                  );
                }
              }
              return null;
            })()}
          </Box>
        )}

        {/* Шаг 2: Отзывы о товарах */}
        {currentStep === 1 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingBag color="primary" />
              {t('reviews.form.productReviewsStep')}
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
              {t('reviews.page.leaveReviewForEach')}
            </Typography>

            {productReviews.map((review, index) => (
              <Card key={index} sx={{ mb: 3, boxShadow: 1, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 1,
                      border: '2px solid #f0f0f0',
                      flexShrink: 0,
                      backgroundImage: `url(${review.productImage.startsWith('/') ? review.productImage : getImageUrl(review.productImage)})`,
                      backgroundSize: '100% 100%',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {review.product ? getTranslatedName(review.product) : 'Товар'}
                      </Typography>
                      {review.submitted && (
                        <Chip label={t('reviews.modal.productReviewSent')} color="success" size="small" />
                      )}
                    </Box>
                  </Box>

                  {!review.submitted ? (
                    <>
                      <Box sx={{ mb: 2, textAlign: 'center' }}>
                        <Typography component="legend" sx={{ mb: 1 }}>{t('reviews.form.yourRating')}:</Typography>
                        <Rating
                          name={`product-rating-${index}`}
                          value={review.rating}
                          onChange={(event, newValue) => handleProductReviewChange(index, 'rating', newValue)}
                          precision={1}
                          icon={<Star fontSize="inherit" sx={{ color: '#FFD700' }} />}
                          emptyIcon={<Star fontSize="inherit" sx={{ color: '#ccc' }} />}
                          sx={{ fontSize: '2rem' }}
                        />
                      </Box>

                      <TextField
                        label={t('reviews.form.productComment')}
                        multiline
                        rows={3}
                        fullWidth
                        value={review.comment}
                        onChange={(e) => handleProductReviewChange(index, 'comment', e.target.value)}
                        variant="outlined"
                        placeholder={t('reviews.form.productPlaceholder')}
                        sx={{ mb: 2 }}
                      />

                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleSubmitProductReview(index)}
                        disabled={loading}
                        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        sx={{ 
                          py: 1, 
                          borderRadius: 2, 
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                          color: '#fff',
                          fontSize: 15,
                          height: 44,
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                          textTransform: 'none',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                            transform: 'translateY(-1px)'
                          },
                          '&:disabled': {
                            background: '#ccc',
                            boxShadow: 'none',
                            transform: 'none'
                          }
                        }}
                      >
                        {loading ? t('reviews.form.submitting') : t('reviews.form.submit')}
                      </Button>
                    </>
                  ) : (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      {t('reviews.form.success')}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}

            {productReviews.every(review => review.submitted) && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                  {t('reviews.form.allReviewsSubmitted')}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/profile')}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 15,
                    px: 3,
                    py: 1.5,
                    height: 44,
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                    textTransform: 'none',
                    minWidth: 120,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                  }}
                >
                  {t('reviews.form.returnToProfile')}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ReviewPage; 