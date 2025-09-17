import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { Box, Typography, Button, CircularProgress, Grid, Card, CardMedia, CardContent, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getTranslatedName, getTranslatedDescription } from '../utils/translationUtils';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../contexts/ProductsContext';

export default function WishlistPage({ user, wishlist, onWishlistToggle }) {
  console.log('🚀 WishlistPage: Component mounted/rendered', { user: !!user, wishlist, wishlistLength: wishlist?.length });
  
  const [loading, setLoading] = useState(true);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { refreshWishlist } = useProducts();

  // Загружаем данные продуктов для wishlist
  useEffect(() => {
    const loadWishlistProducts = async () => {
      console.log('🔄 WishlistPage: Loading wishlist products', { wishlist, wishlistLength: wishlist?.length });
      
      if (!wishlist || wishlist.length === 0) {
        console.log('❌ WishlistPage: No wishlist items, setting empty array');
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📡 WishlistPage: Fetching products for IDs:', wishlist);
        
        const productPromises = wishlist.map(productId => 
          fetch(`${API_BASE_URL}/api/products/${productId}`)
            .then(res => {
              console.log(`📡 WishlistPage: Fetching product ${productId}, status: ${res.status}`);
              return res.json();
            })
            .catch(error => {
              console.error(`❌ WishlistPage: Error loading product ${productId}:`, error);
              return null;
            })
        );
        
        const products = await Promise.all(productPromises);
        const validProducts = products.filter(product => product !== null);
        console.log('✅ WishlistPage: Loaded products:', { total: products.length, valid: validProducts.length, products: validProducts });
        setWishlistProducts(validProducts);
      } catch (error) {
        console.error('❌ WishlistPage: Error loading wishlist products:', error);
        setWishlistProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlistProducts();
  }, [wishlist]);

  const handleRemove = async (productId) => {
    if (onWishlistToggle) {
      onWishlistToggle(productId, true);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  console.log('🎨 WishlistPage: Rendering', { 
    loading, 
    wishlistLength: wishlist?.length, 
    wishlistProductsLength: wishlistProducts.length,
    wishlist,
    wishlistProducts 
  });

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('common.favorites')}</Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={refreshWishlist}
          size="small"
        >
          Обновить
        </Button>
      </Box>
      {wishlistProducts.length === 0 ? (
        <Typography>{t('common.noWishlistItems')}</Typography>
      ) : (
        <Grid container spacing={3}>
          {wishlistProducts.map(product => (
            <Grid gridColumn="span 12" md="span 6" lg="span 4" key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.imageUrls && product.imageUrls.length > 0 ? `${API_BASE_URL}${product.imageUrls[0]}` : '/photography.jpg'}
                  alt={getTranslatedName(product)}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {getTranslatedName(product)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {getTranslatedDescription(product)}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                    ₪{product.price}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/product/${product.id}`)}
                      size="small"
                    >
                      {t('common.details')}
                    </Button>
                    <IconButton
                      onClick={() => handleRemove(product.id)}
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