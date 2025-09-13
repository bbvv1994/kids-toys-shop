import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    console.log('🔄 UserContext: Loading user data on mount...');
    
    // Сначала пытаемся загрузить пользователя из localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log('📦 UserContext: Saved user exists:', !!savedUser);
    console.log('🔑 UserContext: Token exists:', !!token);
    
    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('👤 UserContext: Parsed user data:', userData);
        
        // Проверяем, что токен совпадает
        if (userData.token === token) {
          console.log('✅ UserContext: Token matches, setting user from localStorage');
          setUser(userData);
          setUserLoading(false);
          return;
        } else {
          console.log('❌ UserContext: Token mismatch, will try to load from server');
        }
      } catch (error) {
        console.error('❌ UserContext: Error parsing saved user:', error);
      }
    }
    
    // Если нет сохраненного пользователя, пытаемся загрузить с сервера
    if (token) {
      console.log('🌐 UserContext: Loading user from server...');
      fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        console.log('📡 UserContext: Server response:', data);
        if (data.id) {
          const userData = { ...data, token };
          console.log('✅ UserContext: Setting user from server');
          setUser(userData);
          // Сохраняем пользователя в localStorage
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          console.log('❌ UserContext: Invalid token, clearing localStorage');
          // Токен недействителен, очищаем localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
        setUserLoading(false);
      })
      .catch(error => {
        console.error('❌ UserContext: Error loading user from server:', error);
        // При ошибке сети не удаляем токен, возможно это временная проблема
        // Устанавливаем пользователя из localStorage если есть
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            console.log('🔄 UserContext: Using saved user on network error');
            setUser(userData);
          } catch (parseError) {
            console.error('❌ UserContext: Error parsing saved user on network error:', parseError);
            setUser(null);
          }
        } else {
          console.log('❌ UserContext: No saved user, setting null');
          setUser(null);
        }
        setUserLoading(false);
      });
    } else {
      console.log('❌ UserContext: No token, setting user to null');
      setUserLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    // Сохраняем пользователя в localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleRegister = (userData) => {
    // Registration logic - usually just show confirmation modal
    // The actual registration is handled by AuthModal
    console.log('User registered:', userData);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    setUser,
    userLoading,
    setUserLoading,
    handleLogout,
    handleLogin,
    handleRegister,
    handleUserUpdate
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
