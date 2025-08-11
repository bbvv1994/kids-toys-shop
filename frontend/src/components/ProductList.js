import React, { useState, useEffect } from 'react';
import { Favorite, FavoriteBorder, Edit, Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';

// Универсальная функция для генерации CSS-класса категории
export function getCategoryClassName(category) {
  return category
    .replace(/ /g, '-')
    .replace(/[׳׳']/g, '')
    .replace(/["'`]/g, '')
    .replace(/[^\w\u0590-\u05FF-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

// Функция для получения класса/пути к картинке по категории
function getCategoryImageClass(category) {
  const translit = getCategoryClassName(category);
  return `category-bg-${translit}`;
}

// Функция для отображения звёзд рейтинга
function renderStars(rating, max = 5) {
  const full = Math.round(rating);
  return (
    <span style={{ color: '#FFD700', fontSize: 18 }}>
      {Array.from({ length: max }, (_, i) => (i < full ? '★' : '☆')).join(' ')}
    </span>
  );
}

function ProductList({ products, onProductDeleted, onRefresh, user, onProductClick, searchQuery, filterCategory, filterAgeGroup, selectedGenders = [], viewMode = 'grid', lottiePlayingMap, setLottiePlayingMap, wishlist = [] }) {
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
  const ageGroups = ['all', ...new Set(products.map(p => p.ageGroup).filter(Boolean))];
  
  const filteredProducts = products
    .filter(product => {
      if (filterCategory !== 'all' && product.category !== filterCategory) return false;
      if (filterAgeGroup !== 'all' && product.ageGroup !== filterAgeGroup) return false;
      if (selectedGenders.length > 0) {
        // Теперь selectedGenders содержит русские названия напрямую
        if (!selectedGenders.includes(product.gender)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name-az':
          return a.name.localeCompare(b.name);
        case 'name-za':
          return b.name.localeCompare(a.name);
        case 'popular':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const handleDelete = async (productId) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          onProductDeleted(productId);
        } else {
          alert(t('common.deleteError'));
        }
      } catch (error) {
        alert(t('common.deleteError'));
      }
    }
  };

  const handleWishlistToggle = async (productId, isInWishlist) => {
    if (!user || !user.token) {
      alert(t('common.loginRequired'));
      return;
    }
    setLottiePlayingMap(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setLottiePlayingMap(prev => ({ ...prev, [productId]: false }));
    }, 1200);
    if (isInWishlist) {
      await fetch(`${API_BASE_URL}/api/profile/wishlist/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ productId })
      });
    } else {
      await fetch(`${API_BASE_URL}/api/profile/wishlist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ productId })
      });
    }
  };

  const handleToggleHidden = async (product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden: !product.isHidden })
      });
      if (response.ok) {
        if (onRefresh) onRefresh();
      } else {
        alert(t('common.deleteError'));
      }
    } catch (error) {
      alert(t('common.deleteError'));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="product-list-container">

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <h3>{t('common.noProducts')}</h3>
          <p>{t('common.noProductsDescription')}</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              user={user}
              inWishlist={wishlist.includes(product.id)}
              onWishlistToggle={handleWishlistToggle}
              lottiePlaying={!!lottiePlayingMap[product.id]}
              onAddToCart={() => {}}
              cart={null}
              onChangeCartQuantity={null}
              onEditProduct={() => {}}
              viewMode={viewMode}
              isAdmin={user?.role === 'admin'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList; 