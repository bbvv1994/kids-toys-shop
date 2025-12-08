// Импортируем существующую конфигурацию
import { API_BASE_URL } from '../config';

export const API_ENDPOINTS = {
  CONTACT: `${API_BASE_URL}/api/contact`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  // Добавьте другие endpoints по необходимости
};

export default API_BASE_URL;
