import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Rating,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import { Star, Store, ThumbUp, ThumbDown, CheckCircle, Cancel, Visibility, VisibilityOff, Delete } from '@mui/icons-material';

const CustomerReviews = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [moderationDialog, setModerationDialog] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`${API_BASE_URL}/api/reviews/shop`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        setError(t('reviews.shop.loadError'));
      }
    } catch (err) {
      setError(t('reviews.shop.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId, status) => {
    setModerating(true);
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`${API_BASE_URL}/api/admin/reviews/shop/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Обновляем список отзывов
        await loadReviews();
        setModerationDialog(false);
        setSelectedReview(null);
      } else {
        const errorData = await response.json();
        console.error('Moderation error:', errorData);
        setError(errorData.error || t('reviews.admin.moderationError'));
      }
    } catch (err) {
      setError(t('reviews.shop.networkError'));
    } finally {
      setModerating(false);
    }
  };

  const handleToggleVisibility = async (reviewId, isHidden) => {
    setModerating(true);
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`${API_BASE_URL}/api/admin/reviews/shop/${reviewId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isHidden })
      });

      if (response.ok) {
        await loadReviews();
      } else {
        const errorData = await response.json();
        setError(errorData.error || t('reviews.admin.moderationError'));
      }
    } catch (err) {
      setError(t('reviews.shop.networkError'));
    } finally {
      setModerating(false);
    }
  };

  const handleDelete = async (reviewId) => {
    setModerating(true);
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch(`${API_BASE_URL}/api/admin/reviews/shop/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadReviews();
        setDeleteDialog(false);
        setReviewToDelete(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || t('reviews.admin.deleteError'));
      }
    } catch (err) {
      setError(t('reviews.shop.networkError'));
    } finally {
      setModerating(false);
    }
  };

  const openDeleteDialog = (review) => {
    setReviewToDelete(review);
    setDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialog(false);
    setReviewToDelete(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'hidden': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    return t(`reviews.admin.status.${status}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'pending': return <ThumbUp />;
      case 'hidden': return <VisibilityOff />;
      default: return <ThumbDown />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadReviews} variant="contained">
          {t('reviews.admin.tryAgain')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        {t('reviews.admin.shopReviews')}
      </Typography>

      {reviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {t('reviews.shop.noReviews')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review._id}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {review.user?.name || t('reviews.shop.anonymousUser')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {t('reviews.shop.rating', { rating: review.rating })}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('reviews.shop.dateFormat', { date: formatDate(review.createdAt) })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={getStatusText(review.status)}
                      color={getStatusColor(review.status)}
                      icon={getStatusIcon(review.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {review.text}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedReview(review);
                      setModerationDialog(true);
                    }}
                    startIcon={<ThumbUp />}
                  >
                    {t('reviews.admin.moderate')}
                  </Button>
                  
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleToggleVisibility(review._id, !review.isHidden)}
                    startIcon={review.isHidden ? <Visibility /> : <VisibilityOff />}
                  >
                    {t('reviews.admin.visibilityToggle')}
                  </Button>
                  
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => openDeleteDialog(review)}
                    startIcon={<Delete />}
                  >
                    {t('reviews.admin.delete')}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Диалог модерации */}
      <Dialog open={moderationDialog} onClose={() => setModerationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('reviews.admin.moderate')}</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedReview.text}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleModerate(selectedReview._id, 'approved')}
                  disabled={moderating}
                  startIcon={<CheckCircle />}
                >
                  {t('reviews.admin.approve')}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleModerate(selectedReview._id, 'rejected')}
                  disabled={moderating}
                  startIcon={<Cancel />}
                >
                  {t('reviews.admin.reject')}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModerationDialog(false)}>
            {t('reviews.modal.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialog} onClose={closeDeleteDialog}>
        <DialogTitle>{t('reviews.admin.delete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('reviews.admin.deleteConfirm')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>
            {t('reviews.form.cancel')}
          </Button>
          <Button
            onClick={() => handleDelete(reviewToDelete?._id)}
            color="error"
            variant="contained"
            disabled={moderating}
          >
            {t('reviews.admin.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerReviews; 