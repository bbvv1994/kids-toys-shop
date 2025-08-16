import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { Box, Typography, Button, CircularProgress, Grid, Card, CardMedia, CardContent, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getTranslatedName, getTranslatedDescription } from '../utils/translationUtils';
import { useTranslation } from 'react-i18next';

export default function WishlistPage({ user, wishlist, onWishlistToggle }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(false);
  }, [wishlist]);

  const handleRemove = async (productId) => {
    if (onWishlistToggle) {
      onWishlistToggle(productId, true);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>{t('common.favorites')}</Typography>
      {wishlist.length === 0 ? (
        <Typography>{t('common.noWishlistItems')}</Typography>
      ) : (
        <Grid container spacing={3}>
          {wishlist.map(item => (
            <Grid gridColumn="span 12" md="span 6" lg="span 4" key={item.productId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.product.imageUrls && item.product.imageUrls.length > 0 ? `${API_BASE_URL}${item.product.imageUrls[0]}` : '/photography.jpg'}
                  alt={getTranslatedName(item.product)}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {getTranslatedName(item.product)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {getTranslatedDescription(item.product)}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                    ₪{item.product.price}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/product/${item.productId}`)}
                      size="small"
                    >
                      {t('common.details')}
                    </Button>
                    <IconButton
                      onClick={() => handleRemove(item.productId)}
                      color="error"
                      size="small"
                    >
                      <Favorite />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
} 