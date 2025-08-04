import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
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
          productName: item.product.name,
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
            console.log('Product reviews progress loaded:', progress.productReviews);
          }
        }
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError(`Ошибка загрузки данных заказа: ${response.status}`);
      }
    } catch (err) {
      console.error('Error loading order data:', err);
      setError('Ошибка загрузки данных заказа');
    }
  };

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
        setError('Отзыв о магазине уже был отправлен');
        return;
      }
    }
    
    if (shopReview.rating === 0) {
      setError('Пожалуйста, поставьте оценку магазину');
      return;
    }

    if (!shopReview.text.trim()) {
      setError('Пожалуйста, напишите отзыв о магазине');
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
        setError(errorData.error || 'Ошибка при отправке отзыва о магазине');
      }
    } catch (err) {
      setError('Произошла ошибка сети или сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProductReview = async (index) => {
    const review = productReviews[index];
    
    // Проверяем, не был ли уже отправлен отзыв о товаре
    if (review.submitted) {
      setError('Отзыв о товаре уже был отправлен');
      return;
    }
    
    if (review.rating === 0) {
      setError('Пожалуйста, поставьте оценку товару');
      return;
    }

    if (!review.comment.trim()) {
      setError('Пожалуйста, напишите отзыв о товаре');
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
        setError(errorData.error || 'Ошибка при отправке отзыва о товаре');
      }
    } catch (err) {
      setError('Произошла ошибка сети или сервера');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Отзыв о магазине', 'Отзывы о товарах'];

  if (!orderData) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
              Отзывы о заказе
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/profile')}
              sx={{ borderRadius: 2 }}
            >
              Назад
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
                Загрузка данных заказа...
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Пожалуйста, подождите
              </Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                Не удалось загрузить данные заказа
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Возможно, ссылка устарела или заказ не найден
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/profile')}
                sx={{ borderRadius: 2 }}
              >
                Вернуться в личный кабинет
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            Отзывы о заказе #{orderData.id}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/profile')}
            sx={{ borderRadius: 2 }}
          >
            Назад
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
            Все отзывы успешно отправлены! Спасибо за ваше мнение!
          </Alert>
        )}

        {/* Шаг 1: Отзыв о магазине */}
        {currentStep === 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Store color="primary" />
              Отзыв о магазине
            </Typography>

            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography component="legend" sx={{ mb: 1 }}>Ваша оценка магазина:</Typography>
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
              label="Ваш отзыв о магазине"
              multiline
              rows={4}
              fullWidth
              value={shopReview.text}
              onChange={(e) => handleShopReviewChange('text', e.target.value)}
              variant="outlined"
              placeholder="Поделитесь своим мнением о магазине, обслуживании, доставке..."
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmitShopReview}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
            >
              {loading ? 'Отправка...' : 'Отправить отзыв о магазине'}
            </Button>
            
            {/* Показываем сообщение, если отзыв уже отправлен */}
            {(() => {
              const reviewProgress = localStorage.getItem(`reviewProgress_${orderData?.id}`);
              if (reviewProgress) {
                const progress = JSON.parse(reviewProgress);
                if (progress.shopReview) {
                  return (
                    <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                      Отзыв о магазине уже отправлен!
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
              Отзывы о товарах
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
              Пожалуйста, оставьте отзыв о каждом товаре из вашего заказа:
            </Typography>

            {productReviews.map((review, index) => (
              <Card key={index} sx={{ mb: 3, boxShadow: 1, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 1 }}
                      image={review.productImage ? 
                        (review.productImage.startsWith('http') ? 
                          review.productImage : 
                          `${API_BASE_URL}${review.productImage}`) :
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAyNUMzMi4xODM0IDI1IDM4IDMxLjgyMzYgMzggMzlDMzggNDYuMTc2NCAzMi4xODM0IDUzIDI1IDUzQzE3LjgxNjYgNTMgMTIgNDYuMTc2NCAxMiAzOUMxMiAzMS44MjM2IDE3LjgxNjYgMjUgMjUgMjVaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0yNSAzMUMyNy43NjE0IDMxIDMwIDMzLjIzODYgMzAgMzZDMzAgMzguNzYxNCAyNy43NjE0IDQxIDI1IDQxQzIyLjIzODYgNDEgMjAgMzguNzYxNCAyMCAzNkMyMCAzMy4yMzg2IDIyLjIzODYgMzEgMjUgMzFaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo='
                      }
                      alt={review.productName}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAyNUMzMi4xODM0IDI1IDM4IDMxLjgyMzYgMzggMzlDMzggNDYuMTc2NCAzMi4xODM0IDUzIDI1IDUzQzE3LjgxNjYgNTMgMTIgNDYuMTc2NCAxMiAzOUMxMiAzMS44MjM2IDE3LjgxNjYgMjUgMjUgMjVaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0yNSAzMUMyNy43NjE0IDMxIDMwIDMzLjIzODYgMzAgMzZDMzAgMzguNzYxNCAyNy43NjE0IDQxIDI1IDQxQzIyLjIzODYgNDEgMjAgMzguNzYxNCAyMCAzNkMyMCAzMy4yMzg2IDIyLjIzODYgMzEgMjUgMzFaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo=';
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {review.productName}
                      </Typography>
                      {review.submitted && (
                        <Chip label="Отзыв отправлен" color="success" size="small" />
                      )}
                    </Box>
                  </Box>

                  {!review.submitted ? (
                    <>
                      <Box sx={{ mb: 2, textAlign: 'center' }}>
                        <Typography component="legend" sx={{ mb: 1 }}>Ваша оценка:</Typography>
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
                        label="Ваш отзыв о товаре"
                        multiline
                        rows={3}
                        fullWidth
                        value={review.comment}
                        onChange={(e) => handleProductReviewChange(index, 'comment', e.target.value)}
                        variant="outlined"
                        placeholder="Напишите, что вам понравилось или не понравилось в товаре..."
                        sx={{ mb: 2 }}
                      />

                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleSubmitProductReview(index)}
                        disabled={loading}
                        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        sx={{ py: 1, borderRadius: 2, fontWeight: 'bold' }}
                      >
                        {loading ? 'Отправка...' : 'Отправить отзыв'}
                      </Button>
                    </>
                  ) : (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      Отзыв успешно отправлен!
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}

            {productReviews.every(review => review.submitted) && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                  Все отзывы отправлены! 🎉
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/profile')}
                  sx={{ borderRadius: 2 }}
                >
                  Вернуться в личный кабинет
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