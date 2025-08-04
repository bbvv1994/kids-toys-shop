import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Button, TextField, Rating, Divider, CircularProgress, Alert
} from '@mui/material';

export default function ReviewModal({ open, onClose, orderId, user }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Магазин
  const [shopRating, setShopRating] = useState(0);
  const [shopText, setShopText] = useState('');
  const [shopSent, setShopSent] = useState(false);
  // Товары
  const [productReviews, setProductReviews] = useState([]);
  const [productSent, setProductSent] = useState({});

  useEffect(() => {
    console.log('ReviewModal useEffect:', { open, orderId, user: !!user?.token });
    
    if (open && orderId && user?.token) {
      console.log('Fetching order data for orderId:', orderId);
      setLoading(true);
      setError('');
      
      fetch(`${API_BASE_URL}/api/profile/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => {
          console.log('Response status:', res.status);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Order data received:', data);
          setOrder(data);
          setProductReviews(
            (data.items || []).map(item => ({
              productId: item.productId,
              name: item.product?.name || '',
              rating: 0,
              text: ''
            }))
          );
        })
        .catch(err => {
          console.error('Error fetching order:', err);
          setError(`Ошибка загрузки заказа: ${err.message}`);
        })
        .finally(() => setLoading(false));
    } else {
      console.log('ReviewModal conditions not met:', { 
        open, 
        orderId, 
        hasUser: !!user, 
        hasToken: !!user?.token 
      });
    }
  }, [open, orderId, user]);

  const handleShopReview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('${API_BASE_URL}/api/reviews/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ orderId, rating: shopRating, text: shopText })
      });
      if (!res.ok) throw new Error('Ошибка отправки отзыва');
      setShopSent(true);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleProductReview = async (idx) => {
    setLoading(true);
    setError('');
    const review = productReviews[idx];
    try {
      const res = await fetch('${API_BASE_URL}/api/reviews/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ orderId, productId: review.productId, rating: review.rating, text: review.text })
      });
      if (!res.ok) throw new Error('Ошибка отправки отзыва');
      setProductSent(prev => ({ ...prev, [review.productId]: true }));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Оставьте отзыв о покупке</DialogTitle>
      <DialogContent>
        {loading && <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {/* Отзыв о магазине */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Оцените магазин</Typography>
          <Rating
            value={shopRating}
            onChange={(_, v) => setShopRating(v)}
            size="large"
          />
          <TextField
            label="Комментарий о магазине"
            multiline
            minRows={2}
            fullWidth
            sx={{ mt: 2 }}
            value={shopText}
            onChange={e => setShopText(e.target.value)}
            disabled={shopSent}
          />
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleShopReview}
            disabled={shopSent || !shopRating || loading}
            fullWidth
          >
            {shopSent ? 'Отзыв отправлен' : 'Отправить отзыв о магазине'}
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {/* Отзывы о товарах */}
        <Typography variant="h6" sx={{ mb: 2 }}>Оцените товары</Typography>
        {productReviews.map((review, idx) => (
          <Box key={review.productId} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
            <Typography sx={{ fontWeight: 500, mb: 1 }}>{review.name}</Typography>
            <Rating
              value={review.rating}
              onChange={(_, v) => setProductReviews(r => r.map((pr, i) => i === idx ? { ...pr, rating: v } : pr))}
            />
            <TextField
              label="Комментарий к товару"
              multiline
              minRows={2}
              fullWidth
              sx={{ mt: 2 }}
              value={review.text}
              onChange={e => setProductReviews(r => r.map((pr, i) => i === idx ? { ...pr, text: e.target.value } : pr))}
              disabled={productSent[review.productId]}
            />
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => handleProductReview(idx)}
              disabled={productSent[review.productId] || !review.rating || loading}
              fullWidth
            >
              {productSent[review.productId] ? 'Отзыв отправлен' : 'Оставить отзыв'}
            </Button>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
} 