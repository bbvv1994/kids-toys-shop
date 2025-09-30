import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useUser } from './UserContext';

const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { user } = useUser();

  // Load products
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        // Фильтруем undefined/null продукты
        const validProducts = Array.isArray(data) ? data.filter(product => product && product.id) : [];
        setProducts(validProducts);
        setProductsLoading(false);
      })
      .catch(error => {
        console.error('Error loading products:', error);
        setProductsLoading(false);
      });
  }, []);

  // Load categories
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories?_t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setDbCategories(data);
        setCategoriesLoading(false);
      })
      .catch(error => {
        console.error('Error loading categories:', error);
        setCategoriesLoading(false);
      });
  }, []);

  // Load wishlist when user is authenticated
  useEffect(() => {
    if (user && user.token) {
      console.log('🔄 Loading wishlist for user:', user.email);
      fetch(`${API_BASE_URL}/api/profile/wishlist`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('🔍 ProductsContext: Initial wishlist data from API:', data);
        const wishlistItems = data.items || [];
        console.log('🔍 ProductsContext: Wishlist items:', wishlistItems);
        // Преобразуем в массив ID для удобства использования
        const wishlistIds = wishlistItems.map(item => item.productId);
        console.log('🔍 ProductsContext: Initial extracted IDs:', wishlistIds);
        console.log('🔍 ProductsContext: Initial ID types:', wishlistIds.map(id => typeof id));
        setWishlist(wishlistIds);
        console.log('✅ Wishlist loaded:', wishlistIds);
      })
      .catch(error => {
        console.error('❌ Error loading wishlist:', error);
        setWishlist([]);
      });
    } else {
      setWishlist([]);
    }
  }, [user]);

  const handleWishlistToggle = async (productId, isInWishlist) => {
    console.log('🔄 handleWishlistToggle called:', { 
      productId, 
      productIdType: typeof productId,
      isInWishlist, 
      user: !!user, 
      token: !!user?.token,
      currentWishlist: wishlist,
      currentWishlistLength: wishlist.length
    });
    
    if (!user || !user.token) {
      console.log('❌ No user or token, showing auth modal');
      // TODO: Show auth modal
      return;
    }
    
    try {
      const endpoint = isInWishlist ? 'remove' : 'add';
      console.log('📡 Making API request:', { endpoint, productId, url: `${API_BASE_URL}/api/profile/wishlist/${endpoint}` });
      
      const response = await fetch(`${API_BASE_URL}/api/profile/wishlist/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId: Number(productId) })
      });
      
      console.log('📡 API response:', { status: response.status, ok: response.ok });
      
      if (response.ok) {
        const updatedWishlist = await response.json();
        console.log('📦 Updated wishlist from API:', updatedWishlist);
        // Преобразуем в массив ID для удобства использования
        const wishlistIds = (updatedWishlist.items || []).map(item => item.productId);
        console.log('🔍 ProductsContext: Raw wishlist from API:', updatedWishlist);
        console.log('🔍 ProductsContext: Extracted IDs:', wishlistIds);
        console.log('🔍 ProductsContext: ID types:', wishlistIds.map(id => typeof id));
        setWishlist(wishlistIds);
        console.log('✅ Wishlist updated successfully:', wishlistIds);
      } else {
        const errorData = await response.json();
        console.error('❌ Wishlist API error:', errorData);
        
        // Если токен истек, выходим из системы
        if (response.status === 401) {
          console.log('🔐 Token expired, logging out');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
          return;
        }
        
        // Если товар уже в избранном, обновляем локальное состояние и принудительно обновляем wishlist
        if (errorData.error === 'Товар уже в избранном' && !isInWishlist) {
          setWishlist(prevWishlist => {
            if (!prevWishlist.includes(productId)) {
              return [...prevWishlist, productId];
            }
            return prevWishlist;
          });
          console.log('✅ Item already in wishlist, updated local state');
          
          // Принудительно обновляем wishlist с сервера для синхронизации
          setTimeout(() => {
            refreshWishlist();
          }, 100);
        }
        // Если товар не найден в избранном при попытке удаления, обновляем локальное состояние
        else if (errorData.error && isInWishlist) {
          setWishlist(prevWishlist => prevWishlist.filter(id => id !== productId));
          console.log('✅ Item not in wishlist, updated local state');
        }
      }
    } catch (error) {
      console.error('❌ Error toggling wishlist:', error);
    }
  };

  // Функция для принудительного обновления категорий
  const refreshCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories?_t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setDbCategories(data);
        console.log('✅ Categories refreshed in ProductsContext');
      }
    } catch (error) {
      console.error('Error refreshing categories:', error);
    }
  };

  // Функция для принудительного обновления товаров
  const refreshProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products?_t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        // Фильтруем undefined/null продукты
        const validProducts = Array.isArray(data) ? data.filter(product => product && product.id) : [];
        setProducts(validProducts);
        console.log('✅ Products refreshed in ProductsContext');
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Функция для принудительного обновления wishlist
  const refreshWishlist = async () => {
    if (!user || !user.token) {
      console.log('❌ No user or token for wishlist refresh');
      return;
    }

    try {
      console.log('🔄 Refreshing wishlist...');
      const response = await fetch(`${API_BASE_URL}/api/profile/wishlist?_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const wishlistItems = data.items || [];
        const wishlistIds = wishlistItems.map(item => item.productId);
        console.log('📦 Raw wishlist data from server:', data);
        console.log('📦 Wishlist items:', wishlistItems);
        console.log('📦 Wishlist IDs:', wishlistIds);
        setWishlist(wishlistIds);
        console.log('✅ Wishlist refreshed and state updated');
      } else {
        console.error('❌ Error refreshing wishlist:', response.status);
      }
    } catch (error) {
      console.error('❌ Error refreshing wishlist:', error);
    }
  };

  const value = {
    products,
    setProducts,
    dbCategories,
    setDbCategories,
    wishlist,
    setWishlist,
    productsLoading,
    categoriesLoading,
    handleWishlistToggle,
    refreshCategories,
    refreshProducts,
    refreshWishlist
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
