#!/usr/bin/env node

/**
 * Скрипт для отладки проблем с регистрацией
 */

// Используем встроенный fetch для Node.js 18+
const fetch = globalThis.fetch || require('node-fetch');

const API_BASE_URL = 'http://localhost:5001';

// Функция для логирования с временными метками
function log(emoji, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`${emoji} [${timestamp}] ${message}`);
  if (data) {
    console.log(`${emoji} Data:`, JSON.stringify(data, null, 2));
  }
}

async function testRegistration() {
  try {
    log('👤', 'Testing registration with different user data...');
    
    // Попробуем разные варианты данных
    const testUsers = [
      {
        email: 'test1@example.com',
        password: 'test123456',
        name: 'Test User 1'
      },
      {
        email: 'admin@test.com',
        password: 'admin123',
        name: 'Test Admin'
      },
      {
        email: 'user@test.com',
        password: 'password123',
        name: 'Test User'
      }
    ];
    
    for (const userData of testUsers) {
      log('👤', `Trying to register: ${userData.email}`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      log('👤', 'Registration response', {
        email: userData.email,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        log('✅', 'Registration successful', data);
        return { success: true, user: userData };
      } else {
        const errorData = await response.json();
        log('❌', 'Registration failed', errorData);
      }
    }
    
    return { success: false };
  } catch (error) {
    log('❌', 'Registration exception', { error: error.message });
    return { success: false, error: error.message };
  }
}

async function testLogin(email, password) {
  try {
    log('🔐', `Testing login for: ${email}`);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    log('🔐', 'Login response', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      const data = await response.json();
      log('✅', 'Login successful', {
        hasToken: !!data.token,
        userRole: data.user?.role
      });
      return data.token;
    } else {
      const errorData = await response.json();
      log('❌', 'Login failed', errorData);
      return null;
    }
  } catch (error) {
    log('❌', 'Login exception', { error: error.message });
    return null;
  }
}

async function runDebug() {
  log('🚀', 'Starting registration debug...');
  
  // 1. Тестируем регистрацию
  const registrationResult = await testRegistration();
  
  if (registrationResult.success) {
    // 2. Тестируем вход
    const token = await testLogin(registrationResult.user.email, registrationResult.user.password);
    
    if (token) {
      log('🎉', 'User created and login successful!');
      log('💡', 'Credentials:', {
        email: registrationResult.user.email,
        password: registrationResult.user.password
      });
    } else {
      log('⚠️', 'User created but login failed. Email confirmation may be required.');
    }
  } else {
    log('❌', 'All registration attempts failed.');
    log('💡', 'Check server logs for more details.');
  }
}

// Запуск
runDebug().catch(error => {
  log('💥', 'Debug crashed', { error: error.message, stack: error.stack });
});
