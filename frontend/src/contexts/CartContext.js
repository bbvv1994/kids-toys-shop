import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useUser } from './UserContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [cartLoading, setCartLoading] = useState(true);
  const { user } = useUser();

  // Load cart when user is authenticated
  useEffect(() => {
    setCartLoading(true);
    if (user && user.token) {
      fetch(`${API_BASE_URL}/api/profile/cart`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setCart(data);
        setCartLoading(false);
      })
      .catch(error => {
        console.error('Error loading cart:', error);
        setCart({ items: [] });
        setCartLoading(false);
      });
    } else {
      // Для незарегистрированных пользователей загружаем локальную корзину
      const localCart = JSON.parse(localStorage.getItem('localCart') || '{"items": []}');
      setCart(localCart);
      setCartLoading(false);
    }
  }, [user]);

  const handleAddToCart = async (product, category, quantity = 1, selectedColor = null) => {
    if (!user || !user.token) {
      // Для незарегистрированных пользователей используем локальную корзину
      const localCart = JSON.parse(localStorage.getItem('localCart') || '{"items": []}');
      
      // Проверяем, есть ли уже такой товар в корзине (с учетом цвета)
      const existingItem = localCart.items.find(item => 
        item.product.id === product.id && item.selectedColor === selectedColor
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        localCart.items.push({
          id: Date.now() + Math.random(), // Уникальный ID для локального элемента
          product: product,
          quantity: quantity,
          selectedColor: selectedColor // Сохраняем выбранный цвет
        });
      }
      
      localStorage.setItem('localCart', JSON.stringify(localCart));
      setCart(localCart);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ 
          productId: product.id, 
          quantity: quantity,
          selectedColor: selectedColor // Отправляем цвет на сервер
        })
      });
      
      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        console.error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const handleChangeCartQuantity = async (productId, quantity) => {
    if (!user || !user.token) {
      // Для незарегистрированных пользователей обновляем локальную корзину
      const localCart = JSON.parse(localStorage.getItem('localCart') || '{"items": []}');
      const itemIndex = localCart.items.findIndex(item => item.product.id === productId);
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          localCart.items.splice(itemIndex, 1);
        } else {
          localCart.items[itemIndex].quantity = quantity;
        }
        
        localStorage.setItem('localCart', JSON.stringify(localCart));
        setCart(localCart);
      }
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/cart/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      
      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!user || !user.token) {
      // Для незарегистрированных пользователей удаляем из локальной корзины
      const localCart = JSON.parse(localStorage.getItem('localCart') || '{"items": []}');
      const itemIndex = localCart.items.findIndex(item => item.product.id === productId);
      
      if (itemIndex !== -1) {
        localCart.items.splice(itemIndex, 1);
        localStorage.setItem('localCart', JSON.stringify(localCart));
        setCart(localCart);
      }
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/cart/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId })
      });
      
      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  // Функция для очистки корзины после успешного заказа
  const handleClearCart = async () => {
    if (!user || !user.token) {
      // Для незарегистрированных пользователей очищаем локальную корзину
      localStorage.removeItem('localCart');
      setCart({ items: [] });
      return;
    }
    
    try {
      // Очищаем корзину на фронтенде
      setCart({ items: [] });
      
      // Обновляем корзину через API для синхронизации с сервером
      const response = await fetch(`${API_BASE_URL}/api/profile/cart`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const value = {
    cart,
    setCart,
    cartLoading,
    setCartLoading,
    handleAddToCart,
    handleChangeCartQuantity,
    handleRemoveFromCart,
    handleClearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
