import React from 'react';

export default function AttributionPage() {
  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
      <h2 style={{ marginBottom: 16 }}>Атрибуция изображений</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>
        На этой странице приведены авторы и источники изображений, используемых на сайте. Мы благодарим всех авторов за предоставленные фотографии!
      </p>
      <ul style={{ color: '#444', fontSize: '1.05em', lineHeight: 1.7 }}>
        {/* Пример атрибуции — добавляйте новые пункты ниже */}
        <li>
          Фото <a href="https://unsplash.com/@photographer" target="_blank" rel="noopener noreferrer">Photographer Name</a> с <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>
        </li>
        <li>
          <a href="https://ru.freepik.com/free-photo/various-animal-toy-figures-blue-surface_11309811.htm" target="_blank" rel="noopener noreferrer">Изображение от rawpixel.com на Freepik</a>
        </li>
        <li>
          <a href="https://ru.freepik.com/free-photo/high-angle-parent-kid-playing_30555959.htm" target="_blank" rel="noopener noreferrer">Изображение от freepik</a>
        </li>
        <li>
          <a href="https://ru.freepik.com/free-photo/fluffy-toy-texture-close-up_31897692.htm" target="_blank" rel="noopener noreferrer">Изображение от freepik</a>
        </li>
        <li>
          <a href="https://ru.freepik.com/free-photo/fidget-pop-it-toy-rainbow-color-antistress-fun-educational_18397696.htm" target="_blank" rel="noopener noreferrer">Изображение от Mateus Andre на Freepik</a>
        </li>
        <li>
          <a href="https://ru.freepik.com/free-photo/happy-kids-playing-outdoors_30588965.htm" target="_blank" rel="noopener noreferrer">Изображение от freepik</a>
        </li>
        <li>
          <a href="https://ru.freepik.com/free-photo/set-toy-medical-equipment_12231609.htm" target="_blank" rel="noopener noreferrer">Изображение от freepik</a>
        </li>
        <li>
          <a href="https://ru.freepik.com/free-photo/colorful-decorative-elements-wooden-white-textured-backdrop_3134539.htm" target="_blank" rel="noopener noreferrer">Изображение от freepik</a>
        </li>
        <li>
          <a href="https://ru.freepik.com/free-photo/close-up-small-cars-model-road-traffic-conception_6446502.htm" target="_blank" rel="noopener noreferrer">Изображение от freepik</a>
        </li>
        <li>
          Photo by <a href="https://unsplash.com/@phillipglickman?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Phillip Glickman</a> on <a href="https://unsplash.com/photos/green-and-multicolored-robot-figurine-2umO15jsZKM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener noreferrer">Unsplash</a>
        </li>
        <li>
          <a href="https://ru.freepik.com/free-photo/three-buckets-with-sand-spade-beach_991233.htm" target="_blank" rel="noopener noreferrer">Изображение от awesomecontent на Freepik</a>
        </li>
        <li>
          <a href="https://ru.freepik.com/free-photo/flat-lay-birthday-composition-with-balloons_4165932.htm" target="_blank" rel="noopener noreferrer">Изображение от freepik</a>
        </li>
        {/* Добавляйте новые пункты сюда по мере необходимости */}
      </ul>
    </div>
  );
} 