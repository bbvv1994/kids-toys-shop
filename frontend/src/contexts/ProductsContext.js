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
        setProducts(data);
        setProductsLoading(false);
      })
      .catch(error => {
        console.error('Error loading products:', error);
        setProductsLoading(false);
      });
  }, []);

  // Load categories
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
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
        const wishlistItems = data.items || [];
        setWishlist(wishlistItems);
      })
      .catch(error => {
        console.error('Error loading wishlist:', error);
        setWishlist([]);
      });
    } else {
      setWishlist([]);
    }
  }, [user]);

  const handleWishlistToggle = async (productId, isInWishlist) => {
    if (!user || !user.token) {
      // TODO: Show auth modal
      return;
    }
    
    try {
      const endpoint = isInWishlist ? 'remove' : 'add';
      const response = await fetch(`${API_BASE_URL}/api/profile/wishlist/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId: Number(productId) })
      });
      
      if (response.ok) {
        const updatedWishlist = await response.json();
        setWishlist(updatedWishlist.items || []);
      } else {
        const errorData = await response.json();
        console.error('Wishlist API error:', errorData);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
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
    handleWishlistToggle
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
