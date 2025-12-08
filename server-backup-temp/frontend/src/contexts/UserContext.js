import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    
    // Сначала пытаемся загрузить пользователя из localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    
    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        
        // Проверяем, что токен совпадает
        if (userData.token === token) {
          setUser(userData);
          setUserLoading(false);
          return;
        } else {
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
    
    // Если нет сохраненного пользователя, пытаемся загрузить с сервера
    if (token) {
      fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          const userData = { ...data, token };
          setUser(userData);
          // Сохраняем пользователя в localStorage
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Токен недействителен, очищаем localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
        setUserLoading(false);
      })
      .catch(error => {
        console.error('Error loading user from server:', error);
        // При ошибке сети не удаляем токен, возможно это временная проблема
        // Устанавливаем пользователя из localStorage если есть
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
          } catch (parseError) {
            console.error('Error parsing saved user on network error:', parseError);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setUserLoading(false);
      });
    } else {
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
