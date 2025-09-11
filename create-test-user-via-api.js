#!/usr/bin/env node

/**
 * Скрипт для создания тестового пользователя через API
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

async function createTestUser() {
  try {
    log('👤', 'Creating test admin user...');
    
    const userData = {
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Test Admin'
    };
    
    log('👤', 'User data', userData);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    log('👤', 'Registration response', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      const data = await response.json();
      log('✅', 'User created successfully', data);
      return true;
    } else {
      const errorData = await response.json();
      if (errorData.error === 'Пользователь уже существует') {
        log('ℹ️', 'User already exists, this is OK');
        return true;
      } else {
        log('❌', 'Registration failed', errorData);
        return false;
      }
    }
  } catch (error) {
    log('❌', 'Registration exception', { error: error.message });
    return false;
  }
}

async function confirmEmail() {
  try {
    log('📧', 'Attempting to confirm email...');
    
    // Попробуем несколько возможных токенов
    const possibleTokens = [
      'test-verification-token-123',
      'admin-test-token',
      'verification-token-admin'
    ];
    
    for (const token of possibleTokens) {
      log('📧', `Trying token: ${token}`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/confirm?token=${token}`);
      
      log('📧', 'Confirm response', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        log('✅', 'Email confirmed successfully', data);
        return true;
      }
    }
    
    log('⚠️', 'Could not confirm email automatically');
    return false;
  } catch (error) {
    log('❌', 'Email confirmation exception', { error: error.message });
    return false;
  }
}

async function testLogin() {
  try {
    log('🔐', 'Testing login after user creation...');
    
    const loginData = {
      email: 'admin@test.com',
      password: 'admin123'
    };
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
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
        userRole: data.user?.role,
        userEmail: data.user?.email
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

async function runUserCreation() {
  log('🚀', 'Starting test user creation process...');
  
  // 1. Создаем пользователя
  const userCreated = await createTestUser();
  if (!userCreated) {
    log('❌', 'Failed to create user. Stopping.');
    return;
  }
  
  // 2. Пытаемся подтвердить email
  const emailConfirmed = await confirmEmail();
  if (!emailConfirmed) {
    log('⚠️', 'Email not confirmed automatically. You may need to confirm manually.');
  }
  
  // 3. Тестируем вход
  const token = await testLogin();
  if (token) {
    log('🎉', 'Test user setup completed successfully!');
    log('💡', 'You can now use these credentials:');
    log('💡', 'Email: admin@test.com');
    log('💡', 'Password: admin123');
  } else {
    log('❌', 'Login failed. You may need to confirm email manually.');
    log('💡', 'Try logging in through the browser and check your email.');
  }
}

// Запуск
runUserCreation().catch(error => {
  log('💥', 'User creation crashed', { error: error.message, stack: error.stack });
});
