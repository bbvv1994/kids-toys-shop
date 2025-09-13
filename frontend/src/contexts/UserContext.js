import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setUser({ ...data, token });
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
        setUserLoading(false);
      })
      .catch(error => {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
        setUser(null);
        setUserLoading(false);
      });
    } else {
      setUserLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleLogin = (userData) => {
    setUser(userData);
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
