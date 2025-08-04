import { getImageUrl } from '../config.js';

export function getCategoryIcon(category) {
  // console.log('=== getCategoryIcon called ===');
  // console.log('Category object:', category);
  // console.log('Category name:', category?.name);
  // console.log('Category image:', category?.image);
  
  if (!category) {
    // console.log('No category provided, returning default');
    return '/toys.png';
  }
  
  // Если есть изображение, используем функцию getImageUrl
  if (category.image) {
    const url = getImageUrl(category.image);
    // console.log('Returning image URL:', url);
    return url;
  }
  
  // Fallback иконки для разных категорий
  const fallbackIcons = {
    'Игрушки': '/toys.png',
    'Конструкторы': '/constructor.png',
    'Пазлы': '/puzzle.png',
    'Творчество': '/creativity.png',
    'Канцтовары': '/stationery.png',
    'Транспорт': '/bicycle.png',
    'Отдых на воде': '/voda.png',
    'Настольные игры': '/nastolka.png',
    'Развивающие игры': '/edu_game.png',
    'Акции': '/sale.png'
  };
  
  // Сначала проверяем точное совпадение
  if (fallbackIcons[category.name]) {
    console.log(`Exact match found for "${category.name}": ${fallbackIcons[category.name]}`);
    return fallbackIcons[category.name];
  }
  
  // Если точного совпадения нет, ищем частичное совпадение
  const categoryNameLower = category.name.toLowerCase();
  for (const [key, icon] of Object.entries(fallbackIcons)) {
    const keyLower = key.toLowerCase();
    if (categoryNameLower.includes(keyLower) || keyLower.includes(categoryNameLower)) {
      console.log(`Partial match found: "${category.name}" matches "${key}": ${icon}`);
      return icon;
    }
  }
  
  // Дополнительные правила для частичного совпадения
  const partialMatches = {
    'пазл': '/puzzle.png',
    'конструктор': '/constructor.png',
    'игруш': '/toys.png',
    'творчеств': '/creativity.png',
    'канцтовар': '/stationery.png',
    'транспорт': '/bicycle.png',
    'вода': '/voda.png',
    'настольн': '/nastolka.png',
    'развивающ': '/edu_game.png',
    'акци': '/sale.png',
    'игра': '/toys.png',
    'развитие': '/edu_game.png',
    'образован': '/edu_game.png',
    'рисован': '/creativity.png',
    'краск': '/creativity.png',
    'лепк': '/creativity.png',
    'машин': '/bicycle.png',
    'авто': '/bicycle.png',
    'велосипед': '/bicycle.png',
    'карандаш': '/stationery.png',
    'ручк': '/stationery.png',
    'бумаг': '/stationery.png',
    'альбом': '/creativity.png'
  };
  
  for (const [keyword, icon] of Object.entries(partialMatches)) {
    if (categoryNameLower.includes(keyword)) {
      console.log(`Keyword match found: "${category.name}" contains "${keyword}": ${icon}`);
      return icon;
    }
  }
  
  // Если ничего не найдено, возвращаем заглушку
  // console.log(`No match found for category "${category.name}", using default: /toys.png`);
  // console.log('=== getCategoryIcon finished ===');
  return '/toys.png';
} 

// Преобразует плоский массив категорий с parentId в дерево с подкатегориями (sub)
export function transformCategoriesForNavigation(categories) {
  if (!Array.isArray(categories)) return [];
  
  // Фильтруем только активные категории
  const activeCategories = categories.filter(cat => cat.active !== false);
  
  // Создаём карту по id
  const map = {};
  activeCategories.forEach(cat => {
    map[cat.id] = {
      ...cat,
      label: cat.label || cat.name,
      icon: getCategoryIcon(cat),
      sub: [],
    };
  });
  // Формируем дерево
  const tree = [];
  categories.forEach(cat => {
    if (cat.parentId) {
      if (map[cat.parentId]) {
        map[cat.parentId].sub.push(map[cat.id]);
      }
    } else {
      tree.push(map[cat.id]);
    }
  });
  // Сортируем корневые категории по order, если есть
  tree.sort((a, b) => (a.order || 0) - (b.order || 0));
  // Можно также сортировать подкатегории, если нужно
  tree.forEach(cat => {
    if (cat.sub && cat.sub.length > 0) {
      cat.sub.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  });
  return tree;
} 