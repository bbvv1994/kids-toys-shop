import React from 'react';
import { Favorite, FavoriteBorder, Edit, RateReview } from '@mui/icons-material';
import { Box, Button, IconButton, Typography, Rating, Chip, useMediaQuery, useTheme } from '@mui/material';
import { getImageUrl } from '../config';
import { useNavigate } from 'react-router-dom';
import { getCategoryIcon } from '../utils/categoryIcon';
import { useDeviceType } from '../utils/deviceDetection';
import Lottie from 'lottie-react';
import wishlistHeartAnim from '../lottie/wishlist-heart.json';
import addToCartAnim from '../lottie/cart checkout - fast.json';
import { useTranslation } from 'react-i18next';

const ageIcons = {
  '0-1 год': '/age-icons/0-1.png',
  '1-3 года': '/age-icons/1-3.png',
  '3-5 лет': '/age-icons/3-5.png',
  '5-7 лет': '/age-icons/5-7.png',
  '7-10 лет': '/age-icons/7-10.png',
  '10-12 лет': '/age-icons/10-12.png',
  '12-14 лет': '/age-icons/12-14.png',
  '14-16 лет': '/age-icons/14-16.png'
};



const ProductCard = React.memo(function ProductCard({ product, user, inWishlist, onWishlistToggle, onClick, isAdmin, onAddToCart, cart, onEditProduct, onChangeCartQuantity, viewMode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const [localQuantity, setLocalQuantity] = React.useState(1);
  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef();
  const navigate = useNavigate();
  const [imgError, setImgError] = React.useState(false);
  
  // Упрощенная логика анимации как в ProductPage
  const [wishlistAnimPlaying, setWishlistAnimPlaying] = React.useState(false);
  const [wishlistAnimKey, setWishlistAnimKey] = React.useState(0);
  const [cartAnimPlaying, setCartAnimPlaying] = React.useState(false);
  const [cartAnimKey, setCartAnimKey] = React.useState(0);

  React.useEffect(() => { setImgError(false); }, [product?.id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  const handleWishlistClick = React.useCallback(e => {
    e.stopPropagation();
    if (wishlistAnimPlaying) return;
    
    // Запускаем анимацию только при добавлении в избранное
    if (!inWishlist) {
      setWishlistAnimKey(prev => prev + 1);
      setWishlistAnimPlaying(true);
      setTimeout(() => {
        setWishlistAnimPlaying(false);
      }, 800);
    }
    
    if (onWishlistToggle) onWishlistToggle(product.id, inWishlist);
  }, [wishlistAnimPlaying, inWishlist, onWishlistToggle, product.id]);

  const handleAddToCartClick = React.useCallback((e) => {
    e.stopPropagation();
    if (cart?.items?.some(item => item.product.id === product.id)) return;
    setCartAnimKey(prev => prev + 1);
    setCartAnimPlaying(true);
    setTimeout(() => {
      setCartAnimPlaying(false);
    }, 800);
    if (onAddToCart) onAddToCart(product, product.category, localQuantity);
  }, [cart, product, onAddToCart, localQuantity]);

  if (viewMode === 'carousel') {
    return (
      <Box
        ref={cardRef}
        sx={{
          position: 'relative',
          background: '#fff',
          borderRadius: isMobile ? 2 : 3,
          overflow: 'visible',
          cursor: 'pointer',
          height: '100%',
          width: viewMode === 'carousel' ? '100%' : { xs: '320px', sm: '100%' },
          maxWidth: viewMode === 'carousel' ? 320 : undefined,
          margin: viewMode === 'carousel' ? '0 auto' : undefined,
          display: 'flex',
        flexDirection: 'column',
          isolation: 'isolate',
          zIndex: isHovered ? 10 : 1,
          transform: isMobile ? 'none' : (isHovered ? 'translateY(-8px)' : 'translateY(0)'),
          boxShadow: isMobile 
            ? '0 2px 8px rgba(0,0,0,0.1)' 
            : (isHovered 
              ? '0 12px 40px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)' 
              : '0 4px 6px rgba(0,0,0,0.08)'),
          transition: isMobile 
            ? 'none' 
            : 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform, box-shadow'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick ? onClick : () => navigate(`/product/${product.id}`)}
      >
        {/* Кнопка избранного с Lottie-анимацией (универсально для каталога и карусели) */}
        {(user && onWishlistToggle) && (
          <Box
            sx={{
              position: 'absolute',
              bottom: isMobile ? 180 : 238,
              right: isMobile ? 6 : 8,
              zIndex: 9999,
              width: isMobile ? 36 : (viewMode === 'carousel' ? 48 : 40),
              height: isMobile ? 36 : (viewMode === 'carousel' ? 48 : 40),
            }}
          >
            {wishlistAnimPlaying && (
              <Box sx={{ 
                position: 'absolute', 
                left: '50%', 
                top: '50%', 
                width: 120, 
                height: 120, 
                transform: 'translate(-50%,-50%)', 
                pointerEvents: 'none', 
                background: 'none', 
                opacity: 1 
              }}>
                <Lottie
                  key={wishlistAnimKey}
                  animationData={wishlistHeartAnim}
                  autoplay
                  loop={false}
                  style={{ width: 120, height: 120, pointerEvents: 'none', background: 'none', opacity: 1 }}
                  rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                />
              </Box>
            )}
            <IconButton
              onClick={handleWishlistClick}
              disabled={wishlistAnimPlaying}
                              sx={{
                  color: inWishlist ? '#e53e3e' : '#666',
                  zIndex: 40,
                  width: isMobile ? 30 : (viewMode === 'carousel' ? 41 : 34),
                  height: isMobile ? 30 : (viewMode === 'carousel' ? 41 : 34),
                  p: 0,
                  pointerEvents: wishlistAnimPlaying ? 'none' : 'auto',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%',
                  '&:hover': {
                    color: inWishlist ? '#c53030' : '#e53e3e',
                  },
                }}
            >
                              {!wishlistAnimPlaying && (
                  inWishlist
                    ? <Favorite sx={{ fontSize: isMobile ? 18 : (viewMode === 'carousel' ? 27 : 22), marginTop: isMobile ? '2px' : '4px' }} />
                    : <FavoriteBorder sx={{ fontSize: isMobile ? 18 : (viewMode === 'carousel' ? 27 : 22), marginTop: isMobile ? '2px' : '4px' }} />
                )}
            </IconButton>
          </Box>
        )}
        {/* Картинка */}
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          height: isMobile ? 160 : 200, 
          overflow: 'hidden', 
          borderRadius: isMobile ? '6px 6px 0px 0px' : '8px 8px 0px 0px',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {(() => {
            const imgSrc = getImageUrl(
              (Array.isArray(product.imageUrls) && product.imageUrls.length > 0 && product.imageUrls[0]) ||
              (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) ||
              product.image ||
              ''
            );
            if (!imgSrc || imgError) {
              return (
                <img src="/photography.jpg" alt={t('productCard.noPhoto')} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px 8px 0px 0px', opacity: 0.5, minWidth: '100%', minHeight: '100%', maxWidth: '100%', maxHeight: '100%' }} />
              );
            }
            return (
              <img
                src={imgSrc}
                alt={typeof product.name === 'string' ? product.name : String(product.name || '')}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: '8px 8px 0px 0px',
                  minWidth: '100%',
                  minHeight: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
                onError={() => setImgError(true)}
              />
            );
          })()}
        </Box>
        <div className="product-info" style={{ padding: isMobile ? '12px' : '16px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
          <h3 className="product-name" style={{
            margin: '-10px 0 0px 0',
            fontSize: '1.1rem', 
            fontWeight: 600, 
            color: '#2d3748',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
            minHeight: '4.5rem',
            maxHeight: '4.5rem'
          }}>
            {typeof product.name === 'string' ? product.name : String(product.name || '')}
          </h3>
          {/* Рейтинг */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, marginTop: 0 }}>
            <Rating
              value={product.rating || 0}
              precision={0.1}
              readOnly
              size="small"
              sx={{ color: '#FFD600' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
              <RateReview sx={{ color: '#666', fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>{product.reviewCount || 0}</Typography>
            </Box>
          </div>
          {/* Цена под рейтингом */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: isMobile ? '1rem' : '1.1rem', color: '#2d3748' }}>
              {formatPrice(product.price)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isAdmin && (
                <>
                  {product.quantity > 0 ? (
                    <Chip label={t('productCard.availability.inStock')} color="success" size="small" />
                  ) : (
                    <Chip label={t('productCard.availability.outOfStock')} color="default" size="small" />
                  )}
                </>
              )}
              {isAdmin && (
                <div style={{ fontSize: '0.9rem', color: '#666', marginLeft: 4 }}>
                  {t('productCard.availability.onWarehouse', { quantity: product.quantity })}
                </div>
              )}
            </div>
          </div>
          <div className="product-meta" style={{ minHeight: 32, display: 'flex', alignItems: 'center' }}>
            {product.ageGroup && (
              <span style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '4px', marginRight: '6px' }}>
                {ageIcons[product.ageGroup] && (
                  <img src={ageIcons[product.ageGroup]} alt="" style={{ width: 28, height: 28, marginRight: 0, verticalAlign: 'middle' }} />
                )}
              </span>
            )}
            {product.gender && (
              <span style={{
                display: 'inline-block',
                fontSize: '0.8rem',
                color: '#666',
                padding: '2px 6px',
                borderRadius: '4px',
                marginBottom: '4px'
              }}>
                {product.gender === 'Для мальчиков' ? t('productCard.gender.boy') : product.gender === 'Для девочек' ? t('productCard.gender.girl') : t('productCard.gender.unisex')}
              </span>
            )}
          </div>
          {/* Счетчик и кнопка — просто в потоке, без absolute */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: viewMode === 'carousel' ? 18 : 8, position: 'relative', flexWrap: 'wrap', justifyContent: 'center', rowGap: 6 }}>
              <button
                style={{
                  border: '1px solid #ddd',
                  background: '#fff',
                  fontSize: viewMode === 'carousel' ? 17 : 18,
                  width: viewMode === 'carousel' ? 26 : 28,
                  height: viewMode === 'carousel' ? 26 : 28,
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#888',
                  display: isAdmin ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                onClick={e => { 
                  e.stopPropagation(); 
                  const isInCart = cart?.items?.some(item => item.product.id === product.id);
                  if (isInCart && onChangeCartQuantity) {
                    // Если товар в корзине - изменяем количество в корзине
                    const cartItem = cart.items.find(item => item.product.id === product.id);
                    onChangeCartQuantity(product.id, Math.max(1, cartItem.quantity - 1));
                  } else {
                    setLocalQuantity(Math.max(1, localQuantity - 1));
                  }
                }}
                disabled={!product.quantity || product.quantity <= 0 || !cart}
              >-</button>
              <span style={{ minWidth: viewMode === 'carousel' ? 20 : 24, textAlign: 'center', fontWeight: 600, fontSize: viewMode === 'carousel' ? 14 : 16, display: isAdmin ? 'none' : 'inline-block' }}>
                {cart?.items?.some(item => item.product.id === product.id) 
                  ? cart.items.find(item => item.product.id === product.id).quantity 
                  : localQuantity}
              </span>
              <button
                style={{
                  border: '1px solid #ddd',
                  background: '#fff',
                  fontSize: viewMode === 'carousel' ? 17 : 18,
                  width: viewMode === 'carousel' ? 26 : 28,
                  height: viewMode === 'carousel' ? 26 : 28,
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#888',
                  display: isAdmin ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                onClick={e => { 
                  e.stopPropagation(); 
                  const isInCart = cart?.items?.some(item => item.product.id === product.id);
                  if (isInCart && onChangeCartQuantity) {
                    // Если товар в корзине - изменяем количество в корзине
                    const cartItem = cart.items.find(item => item.product.id === product.id);
                    onChangeCartQuantity(product.id, cartItem.quantity + 1);
                  } else {
                    if (localQuantity < product.quantity) setLocalQuantity(localQuantity + 1);
                  }
                }}
                disabled={!product.quantity || product.quantity <= 0 || !cart}
              >+</button>
              {isAdmin ? (
                <Button
                  variant="contained"
                  startIcon={<Edit sx={{ fontSize: 18 }} />}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    minWidth: 0,
                    width: 160,
                    height: 32,
                    borderRadius: 6,
                    ml: 1,
                    px: 2,
                    lineHeight: '32px',
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    if (onEditProduct) onEditProduct(product);
                  }}
                >
                  Редактировать
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={
                    <Box sx={{ position: 'relative', width: viewMode === 'carousel' ? 30 : 32, height: viewMode === 'carousel' ? 30 : 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cart?.items?.some(item => item.product.id === product.id) && !cartAnimPlaying ? (
                        <Lottie
                          animationData={addToCartAnim}
                          autoplay={false}
                          loop={false}
                          style={{ width: viewMode === 'carousel' ? 30 : 32, height: viewMode === 'carousel' ? 30 : 32 }}
                          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                          initialSegment={[100, 100]}
                        />
                      ) : (
                        <Lottie
                          key={cartAnimKey}
                          animationData={addToCartAnim}
                          autoplay={cartAnimPlaying}
                          loop={false}
                          style={{ width: viewMode === 'carousel' ? 30 : 32, height: viewMode === 'carousel' ? 30 : 32 }}
                          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                        />
                      )}
                    </Box>
                  }
                  sx={{
                    background: !product.quantity || product.quantity <= 0
                      ? '#bdbdbd'
                      : '#5cb95d',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: viewMode === 'carousel' ? 13 : 14,
                    minWidth: 0,
                    width: viewMode === 'carousel' ? 103 : 110,
                    height: viewMode === 'carousel' ? 30 : 32,
                    borderRadius: 6,
                    ml: -0.25,
                    px: 2,
                    lineHeight: viewMode === 'carousel' ? '30px' : '32px',
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    boxShadow: '0 2px 4px rgba(72, 187, 120, 0.2)',
                    '&:hover': {
                      background: !product.quantity || product.quantity <= 0
                        ? '#bdbdbd'
                        : '#4ca94d',
                      boxShadow: '0 4px 8px rgba(72, 187, 120, 0.3)',
                    },
                    opacity: (!product.quantity || product.quantity <= 0) ? 0.7 : 1,
                    cursor: (!product.quantity || product.quantity <= 0) ? 'not-allowed' : 'pointer',
                    '& .MuiButton-startIcon': { marginRight: 0 },
                  }}
                  onClick={handleAddToCartClick}
                  disabled={!product.quantity || product.quantity <= 0}
                >
                  {!product.quantity || product.quantity <= 0
                    ? t('productCard.addToCart')
                    : (cart?.items?.some(item => item.product.id === product.id) && !cartAnimPlaying
                      ? t('productCard.inCart')
                      : t('productCard.addToCart'))}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Box>
    );
  }

  if (viewMode === 'list') {
    return (
      <Box
        ref={cardRef}
        sx={{
          position: 'relative',
          background: '#fff',
          borderRadius: isMobile ? 2 : 3,
          overflow: 'visible',
          cursor: 'pointer',
          height: isMobile ? 200 : 250,
          minHeight: isMobile ? 200 : 250,
          maxHeight: isMobile ? 200 : 250,
          width: { xs: '320px', sm: '100%' },
          minWidth: 0,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          isolation: 'isolate',
          zIndex: isHovered ? 10 : 1,
          transform: isMobile ? 'none' : (isHovered ? 'translateY(-8px)' : 'translateY(0)'),
          boxShadow: isMobile 
            ? '0 2px 8px rgba(0,0,0,0.1)' 
            : (isHovered 
              ? '0 12px 40px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)' 
              : '0 4px 6px rgba(0,0,0,0.08)'),
          transition: isMobile 
            ? 'none' 
            : 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform, box-shadow',
          mb: isMobile ? 1 : 2,
          alignItems: 'stretch'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick ? onClick : () => navigate(`/product/${product.id}`)}
      >
        {/* Картинка */}
        <Box sx={{ 
          position: 'relative', 
          width: isMobile ? '100%' : 250, 
          minWidth: isMobile ? '100%' : 250, 
          maxWidth: isMobile ? '100%' : 250, 
          height: isMobile ? 120 : 250, 
          minHeight: isMobile ? 120 : 250, 
          maxHeight: isMobile ? 120 : 250, 
          flexShrink: 0, 
          borderRadius: isMobile ? '6px 6px 0 0' : 0, 
          overflow: 'hidden', 
          background: '#f5f5f5', 
          display: 'flex', 
          alignItems: 'stretch', 
          justifyContent: 'center', 
          m: 0, 
          p: 0, 
          pointerEvents: 'none' 
        }}>
          {(() => {
            const imgSrc = getImageUrl(
              (Array.isArray(product.imageUrls) && product.imageUrls.length > 0 && product.imageUrls[0]) ||
              (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) ||
              product.image ||
              ''
            );
            if (!imgSrc || imgError) {
              return (
                <img src="/photography.jpg" alt={t('productCard.noPhoto')} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, opacity: 0.5, minWidth: '100%', minHeight: '100%', maxWidth: '100%', maxHeight: '100%' }} />
              );
            }
            return (
              <img
                src={imgSrc}
                alt={typeof product.name === 'string' ? product.name : String(product.name || '')}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', borderRadius: 0, padding: 0, margin: 0, display: 'block', pointerEvents: 'none' }}
                onError={() => setImgError(true)}
              />
            );
          })()}
        </Box>
        {/* Значок избранного в правом верхнем углу всей карточки */}
        {(user && onWishlistToggle) && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 9999,
              width: 40,
              height: 40,
            }}
          >
            {wishlistAnimPlaying && (
              <Box sx={{ 
                position: 'absolute', 
                left: '50%', 
                top: '50%', 
                width: 120, 
                height: 120, 
                transform: 'translate(-50%,-50%)', 
                pointerEvents: 'none', 
                background: 'none', 
                opacity: 1 
              }}>
                <Lottie
                  key={wishlistAnimKey}
                  animationData={wishlistHeartAnim}
                  autoplay
                  loop={false}
                  style={{ width: 120, height: 120, pointerEvents: 'none', background: 'none', opacity: 1 }}
                  rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                />
              </Box>
            )}
            <IconButton
              onClick={handleWishlistClick}
              disabled={wishlistAnimPlaying}
              sx={{
                color: inWishlist ? '#e53e3e' : '#666',
                zIndex: 40,
                width: 40,
                height: 40,
                p: 0,
                pointerEvents: wishlistAnimPlaying ? 'none' : 'auto',
                background: 'none',
                '&:hover': {
                  color: inWishlist ? '#c53030' : '#e53e3e',
                },
              }}
            >
              {!wishlistAnimPlaying && (
                inWishlist
                  ? <Favorite sx={{ fontSize: 32 }} />
                  : <FavoriteBorder sx={{ fontSize: 32 }} />
              )}
            </IconButton>
          </Box>
        )}
        {/* Правая часть: инфо и кнопки */}
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: viewMode === 'list' ? '60%' : '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', position: 'relative', p: 2 }}>
          {/* Название товара */}
          <h3 style={{ 
            margin: '-10px 0 0px 0',
            fontSize: '1.1rem', 
            fontWeight: 600, 
            color: '#2d3748',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
            minHeight: '4.5rem',
            maxHeight: '4.5rem'
          }}>
            {typeof product.name === 'string' ? product.name : String(product.name || '')}
          </h3>
          {/* Рейтинг */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, marginTop: 0 }}>
            <Rating
              value={product.rating || 0}
              precision={0.1}
              readOnly
              size="small"
              sx={{ color: '#FFD600' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
              <RateReview sx={{ color: '#666', fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>{product.reviewCount || 0}</Typography>
            </Box>
          </div>
          {/* Цена и доп. инфа */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
            <Typography sx={{ color: '#1976d2', fontWeight: 700, fontSize: 18 }}>{formatPrice(product.price)}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isAdmin && (
                <>
                  {product.quantity > 0 ? (
                    <Chip label={t('productCard.availability.inStock')} color="success" size="small" />
                  ) : (
                    <Chip label={t('productCard.availability.outOfStock')} color="default" size="small" />
                  )}
                </>
              )}
              {isAdmin && (
                <Typography sx={{ fontSize: 15, color: '#666', fontWeight: 400, ml: 2 }}>{t('productCard.availability.onWarehouse', { quantity: product.quantity })}</Typography>
              )}
            </Box>
          </Box>
          {/* Категория, возраст, пол */}
          {viewMode === 'list' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, mb: 1, width: 'auto', maxWidth: 'max-content' }}>
              {product.category && (
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.9rem', color: '#1976d2', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, marginBottom: 2 }}>
                  <img src={getCategoryIcon(
                    typeof product.category === 'object' && product.category !== null
                      ? product.category
                      : { name: String(product.category) }
                  )} alt="cat" style={{ width: 20, height: 20, marginRight: 6, verticalAlign: 'middle' }} />
                  {typeof product.category === 'object' && product.category !== null
                    ? (product.category.label || product.category.name || '')
                    : (typeof product.category === 'string' ? product.category : String(product.category || ''))}
                </span>
              )}
              {product.ageGroup && (
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.9rem', color: '#666', padding: '2px 6px', borderRadius: '4px', marginBottom: 2 }}>
                  {ageIcons[product.ageGroup] && (
                    <img src={ageIcons[product.ageGroup]} alt="" style={{ width: 28, height: 28, marginRight: 0, verticalAlign: 'middle' }} />
                  )}
                </span>
              )}
              {product.gender && (
                <span style={{ display: 'inline-block', fontSize: '0.9rem', color: '#666', padding: '2px 6px', borderRadius: '4px' }}>{product.gender === 'Для мальчиков' ? t('productCard.gender.boy') : product.gender === 'Для девочек' ? t('productCard.gender.girl') : t('productCard.gender.unisex')}</span>
              )}
            </Box>
          )}
        </Box>
        {/* Кнопки и счётчик — в правом нижнем углу всей карточки */}
        <Box sx={{ 
          position: 'absolute', 
          right: 274, 
          bottom: 22, 
          zIndex: 50, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start', 
          gap: 0.5, 
          fontSize: 14, 
          color: '#444', 
          borderRadius: 2, 
          px: 2, 
          py: 1, 
          minWidth: 120, 
          wordBreak: 'break-word' 
        }}>
          <div>{t('productCard.sku')}: {product.article || '-'}</div>
          <div>{t('productCard.brand')}: {product.brand || '-'}</div>
          <div>{t('productCard.country')}: {product.manufacturer || product.country || '-'}</div>
          <div dir="rtl" style={{ textAlign: 'right' }}>{product.height && product.length && product.width ? 
            `${product.length}×${product.width}×${product.height} ${t('productCard.units.cm')}` : 
            product.size || '-'}</div>
        </Box>
        <Box sx={{ position: 'absolute', right: 24, bottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          {/* Счетчик и кнопка — просто в потоке, без absolute */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>

              {!isAdmin && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                  <button
                    style={{
                      border: '1px solid #ddd',
                      background: '#fff',
                      fontSize: 18,
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: '#888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                    onClick={e => { 
                      e.stopPropagation(); 
                      if (cart && cart.items?.some(item => item.product.id === product.id) && onChangeCartQuantity) {
                        const cartItem = cart.items.find(item => item.product.id === product.id);
                        onChangeCartQuantity(product.id, Math.max(1, cartItem.quantity - 1));
                      } else {
                        setLocalQuantity(Math.max(1, localQuantity - 1));
                      }
                    }}
                    disabled={!product.quantity || product.quantity <= 0 || !cart}
                  >-</button>
                  <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600, fontSize: 16 }}>
                    {cart?.items?.some(item => item.product.id === product.id) 
                      ? cart.items.find(item => item.product.id === product.id).quantity 
                      : localQuantity}
                  </span>
                  <button
                    style={{
                      border: '1px solid #ddd',
                      background: '#fff',
                      fontSize: 18,
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: '#888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                    onClick={e => { 
                      e.stopPropagation(); 
                      if (cart && cart.items?.some(item => item.product.id === product.id) && onChangeCartQuantity) {
                        const cartItem = cart.items.find(item => item.product.id === product.id);
                        onChangeCartQuantity(product.id, cartItem.quantity + 1);
                      } else {
                        if (localQuantity < product.quantity) setLocalQuantity(localQuantity + 1);
                      }
                    }}
                    disabled={!product.quantity || product.quantity <= 0 || !cart}
                  >+</button>
                </Box>
              )}
              {isAdmin ? (
                <Button
                  variant="contained"
                  startIcon={<Edit sx={{ fontSize: 18 }} />}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    minWidth: 0,
                    width: 160,
                    height: 32,
                    borderRadius: 6,
                    ml: 1,
                    px: 2,
                    lineHeight: '32px',
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    if (onEditProduct) onEditProduct(product);
                  }}
                >
                  Редактировать
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={
                    <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cart?.items?.some(item => item.product.id === product.id) && !cartAnimPlaying ? (
                        <Lottie
                          animationData={addToCartAnim}
                          autoplay={false}
                          loop={false}
                          style={{ width: 32, height: 32 }}
                          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                          initialSegment={[100, 100]}
                        />
                      ) : (
                        <Lottie
                          key={cartAnimKey}
                          animationData={addToCartAnim}
                          autoplay={cartAnimPlaying}
                          loop={false}
                          style={{ width: 32, height: 32 }}
                          rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                        />
                      )}
                    </Box>
                  }
                  sx={{
                    background: !product.quantity || product.quantity <= 0
                      ? '#bdbdbd'
                      : '#5cb95d',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    minWidth: 0,
                    width: 110,
                    height: 32,
                    borderRadius: 6,
                    ml: 1,
                    px: 2,
                    lineHeight: '32px',
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    boxShadow: '0 2px 4px rgba(72, 187, 120, 0.2)',
                    '&:hover': {
                      background: !product.quantity || product.quantity <= 0
                        ? '#bdbdbd'
                        : '#4ca94d',
                      boxShadow: '0 4px 8px rgba(72, 187, 120, 0.3)',
                    },
                    opacity: (!product.quantity || product.quantity <= 0) ? 0.7 : 1,
                    cursor: (!product.quantity || product.quantity <= 0) ? 'not-allowed' : 'pointer',
                    '& .MuiButton-startIcon': { marginRight: 0 },
                  }}
                  onClick={handleAddToCartClick}
                  disabled={!product.quantity || product.quantity <= 0}
                >
                  {!product.quantity || product.quantity <= 0
                    ? t('productCard.addToCart')
                    : (cart?.items?.some(item => item.product.id === product.id) && !cartAnimPlaying
                      ? t('productCard.inCart')
                      : t('productCard.addToCart'))}
                </Button>
              )}
            </div>
          </div>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={cardRef}
      sx={{
        position: 'relative',
        background: '#fff',
        borderRadius: isMobile ? 2 : 3,
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        width: { xs: '320px', sm: '100%' },
        minWidth: 0,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        isolation: 'isolate',
        zIndex: isHovered ? 10 : 1,
        transform: isMobile ? 'none' : (isHovered ? 'translateY(-8px)' : 'translateY(0)'),
        boxShadow: isMobile 
          ? '0 2px 8px rgba(0,0,0,0.1)' 
          : (isHovered 
            ? '0 12px 40px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)' 
            : '0 4px 6px rgba(0,0,0,0.08)'),
        transition: isMobile 
          ? 'none' 
          : 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform, box-shadow'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick ? onClick : () => navigate(`/product/${product.id}`)}
    >
      {(user && onWishlistToggle) && (
        <Box
          sx={{
            position: 'absolute',
            bottom: isMobile ? 180 : 243,
            right: isMobile ? 8 : 12,
            zIndex: 9999,
            width: isMobile ? 36 : (viewMode === 'carousel' ? 48 : 41),
            height: isMobile ? 36 : (viewMode === 'carousel' ? 48 : 41),
          }}
        >
          {wishlistAnimPlaying && (
            <Box sx={{ 
              position: 'absolute', 
              left: '50%', 
              top: '50%', 
              width: 120, 
              height: 120, 
              transform: 'translate(-50%,-50%)', 
              pointerEvents: 'none', 
              background: 'none', 
              opacity: 1 
            }}>
              <Lottie
                key={wishlistAnimKey}
                animationData={wishlistHeartAnim}
                autoplay
                loop={false}
                style={{ width: 120, height: 120, pointerEvents: 'none', background: 'none', opacity: 1 }}
                rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
              />
            </Box>
          )}
          <IconButton
            onClick={handleWishlistClick}
            disabled={wishlistAnimPlaying}
            sx={{
              color: inWishlist ? '#e53e3e' : '#666',
              zIndex: 40,
              width: isMobile ? 30 : (viewMode === 'carousel' ? 41 : 41),
              height: isMobile ? 30 : (viewMode === 'carousel' ? 41 : 41),
              p: 0,
              pointerEvents: wishlistAnimPlaying ? 'none' : 'auto',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              '&:hover': {
                color: inWishlist ? '#c53030' : '#e53e3e',
              },
            }}
          >
            {!wishlistAnimPlaying && (
              inWishlist
                ? <Favorite sx={{ fontSize: isMobile ? 18 : (viewMode === 'carousel' ? 27 : 28), marginTop: isMobile ? '2px' : '4px' }} />
                : <FavoriteBorder sx={{ fontSize: isMobile ? 18 : (viewMode === 'carousel' ? 27 : 28), marginTop: isMobile ? '2px' : '4px' }} />
            )}
          </IconButton>
        </Box>
      )}
      {/* Картинка товара должна идти после кнопки избранного! */}
      {/* Основное содержимое карточки */}
      <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        height: isMobile ? 160 : 200, 
        overflow: 'hidden', 
        borderRadius: isMobile ? '6px 6px 0 0' : '8px 8px 0 0',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {(() => {
          const imgSrc = getImageUrl(
            (Array.isArray(product.imageUrls) && product.imageUrls.length > 0 && product.imageUrls[0]) ||
            (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) ||
            product.image ||
            ''
          );
          if (!imgSrc || imgError) {
            return (
                              <img src="/photography.jpg" alt={t('productCard.noPhoto')} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, opacity: 0.5, minWidth: '100%', minHeight: '100%', maxWidth: '100%', maxHeight: '100%' }} />
            );
          }
          return (
            <img
              src={imgSrc}
              alt={typeof product.name === 'string' ? product.name : String(product.name || '')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                minWidth: '100%',
                minHeight: '100%',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              onError={() => setImgError(true)}
            />
          );
        })()}
      </Box>

      <div className="product-info" style={{ padding: isMobile ? '12px' : '16px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
        {/* Название товара */}
        <h3 style={{ 
          margin: '-10px 0 0px 0',
          fontSize: isMobile ? '1rem' : '1.1rem', 
          fontWeight: 600, 
          color: '#2d3748',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: isMobile ? 2 : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          minHeight: isMobile ? '3rem' : '4.5rem',
          maxHeight: isMobile ? '3rem' : '4.5rem'
        }}>
          {typeof product.name === 'string' ? product.name : String(product.name || '')}
        </h3>
        {/* Рейтинг */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, marginTop: 0 }}>
          <Rating
            value={product.rating || 0}
            precision={0.1}
            readOnly
            size="small"
            sx={{ color: '#FFD600' }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
            <RateReview sx={{ color: '#666', fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>{product.reviewCount || 0}</Typography>
          </Box>
        </div>
        {/* Цена под рейтингом */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: isMobile ? '1rem' : '1.1rem', color: '#2d3748' }}>
            {formatPrice(product.price)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isAdmin && (
              <>
                {product.quantity > 0 ? (
                  <Chip label={t('productCard.availability.inStock')} color="success" size="small" />
                ) : (
                  <Chip label={t('productCard.availability.outOfStock')} color="default" size="small" />
                )}
              </>
            )}
                          {isAdmin && (
                <div style={{ fontSize: '0.9rem', color: '#666', marginLeft: 4 }}>
                  {t('productCard.availability.onWarehouse', { quantity: product.quantity })}
                </div>
              )}
          </div>
        </div>
        <div className="product-meta" style={{ minHeight: 32, display: 'flex', alignItems: 'center' }}>
          {product.ageGroup && (
            <span style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '4px', marginRight: '6px' }}>
              {ageIcons[product.ageGroup] && (
                <img src={ageIcons[product.ageGroup]} alt="" style={{ width: 28, height: 28, marginRight: 0, verticalAlign: 'middle' }} />
              )}
            </span>
          )}
          {product.gender && (
            <span style={{
              display: 'inline-block',
              fontSize: '0.8rem',
              color: '#666',
              padding: '2px 6px',
              borderRadius: '4px',
              marginBottom: '4px'
            }}>
              {product.gender === 'Для мальчиков' ? t('productCard.gender.boy') : product.gender === 'Для девочек' ? t('productCard.gender.girl') : t('productCard.gender.unisex')}
            </span>
          )}
        </div>
        {/* Счетчик и кнопка — просто в потоке, без absolute */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: viewMode === 'similar' ? 6 : 8, position: 'relative', flexWrap: 'wrap', justifyContent: 'center', rowGap: 6, maxWidth: '100%' }}>
            {/* Надпись о наличии товара — только для списка */}
            {viewMode === 'list' && (
              <div style={{
                position: 'absolute',
                left: 'calc(50% + 63px)',
                top: -28,
                transform: 'translateX(-50%)',
                width: 'max-content',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: product.quantity > 0 ? '#38a169' : '#e53e3e',
                marginBottom: 4,
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 2
              }}>
                {product.quantity <= 0 ? 'Нет в наличии' : 'В наличии'}
              </div>
            )}
            <button
              style={{
                border: '1px solid #ddd',
                background: '#fff',
                fontSize: 18,
                width: 28,
                height: 28,
                borderRadius: 6,
                cursor: 'pointer',
                color: '#888',
                display: isAdmin ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              onClick={e => { 
                e.stopPropagation(); 
                const isInCart = cart?.items?.some(item => item.product.id === product.id);
                if (isInCart && onChangeCartQuantity) {
                  // Если товар в корзине - изменяем количество в корзине
                  const cartItem = cart.items.find(item => item.product.id === product.id);
                  onChangeCartQuantity(product.id, Math.max(1, cartItem.quantity - 1));
                } else {
                  // Если товар не в корзине - изменяем локальное количество
                  setLocalQuantity(Math.max(1, localQuantity - 1));
                }
              }}
            >-</button>
            <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600, fontSize: 16, display: isAdmin ? 'none' : 'inline-block' }}>
              {cart?.items?.some(item => item.product.id === product.id) 
                ? cart.items.find(item => item.product.id === product.id).quantity 
                : localQuantity}
            </span>
            <button
              style={{
                border: '1px solid #ddd',
                background: '#fff',
                fontSize: 18,
                width: 28,
                height: 28,
                borderRadius: 6,
                cursor: 'pointer',
                color: '#888',
                display: isAdmin ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              onClick={e => { 
                e.stopPropagation(); 
                const isInCart = cart?.items?.some(item => item.product.id === product.id);
                if (isInCart && onChangeCartQuantity) {
                  // Если товар в корзине - изменяем количество в корзине
                  const cartItem = cart.items.find(item => item.product.id === product.id);
                  onChangeCartQuantity(product.id, cartItem.quantity + 1);
                } else {
                  // Если товар не в корзине - изменяем локальное количество
                  if (localQuantity < product.quantity) setLocalQuantity(localQuantity + 1);
                }
              }}
            >+</button>
            {isAdmin ? (
              <Button
                variant="contained"
                startIcon={<Edit sx={{ fontSize: 18 }} />}
                sx={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  minWidth: 0,
                  width: 160,
                  height: 32,
                  borderRadius: 6,
                  ml: 1,
                  px: 2,
                  lineHeight: '32px',
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                    boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                  },
                  cursor: 'pointer',
                }}
                onClick={e => {
                  e.stopPropagation();
                  if (onEditProduct) onEditProduct(product);
                }}
              >
                Редактировать
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={
                  <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cart?.items?.some(item => item.product.id === product.id) && !cartAnimPlaying ? (
                      <Lottie
                        animationData={addToCartAnim}
                        autoplay={false}
                        loop={false}
                        style={{ width: 32, height: 32 }}
                        rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                        initialSegment={[100, 100]}
                      />
                    ) : (
                      <Lottie
                        key={cartAnimKey}
                        animationData={addToCartAnim}
                        autoplay={cartAnimPlaying}
                        loop={false}
                        style={{ width: 32, height: 32 }}
                        rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                      />
                    )}
                  </Box>
                }
                sx={{
                  background: !product.quantity || product.quantity <= 0
                    ? '#bdbdbd'
                    : '#5cb95d',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  minWidth: 0,
                  width: viewMode === 'carousel' ? 100 : 110,
                  height: 32,
                  borderRadius: 6,
                  ml: viewMode === 'similar' ? 0.375 : 0.625,
                  px: 2,
                  lineHeight: '32px',
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  boxShadow: '0 2px 4px rgba(72, 187, 120, 0.2)',
                  '&:hover': {
                    background: !product.quantity || product.quantity <= 0
                      ? '#bdbdbd'
                      : '#4ca94d',
                    boxShadow: '0 4px 8px rgba(72, 187, 120, 0.3)',
                  },
                  opacity: (!product.quantity || product.quantity <= 0) ? 0.7 : 1,
                  cursor: (!product.quantity || product.quantity <= 0) ? 'not-allowed' : 'pointer',
                  '& .MuiButton-startIcon': { marginRight: 0 },
                }}
                onClick={handleAddToCartClick}
                disabled={!product.quantity || product.quantity <= 0}
              >
                {!product.quantity || product.quantity <= 0
                  ? t('productCard.addToCart')
                  : (cart?.items?.some(item => item.product.id === product.id) && !cartAnimPlaying
                    ? t('productCard.inCart')
                    : t('productCard.addToCart'))}
              </Button>
            )}
          </div>
        </div>

        {/* Popover - часть карточки, плавно появляется */}
        {viewMode !== 'carousel' && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '100%',
              zIndex: 100,
              background: '#fff',
              borderRadius: '0 0 16px 16px',
              opacity: isHovered ? 1 : 0,
              pointerEvents: isHovered ? 'auto' : 'none',
              transform: isHovered ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'opacity 0.2s, transform 0.2s',
              padding: 2,
              marginTop: '-4px',
            }}
          >
            <div style={{ 
              fontSize: 14, 
              color: '#444',
              textAlign: 'left'
            }}>
              <div>{t('productCard.sku')}: {product.article || '-'}</div>
              <div>{t('productCard.brand')}: {product.brand || '-'}</div>
              <div>{t('productCard.country')}: {product.manufacturer || product.country || '-'}</div>
              <div dir="rtl" style={{ textAlign: 'right' }}>{product.height && product.length && product.width ? 
                `${product.length}×${product.width}×${product.height} ${t('productCard.units.cm')}` : 
                product.size || '-'}</div>
            </div>
          </Box>
        )}
      </div>
    </Box>
  );
});

export default ProductCard; 