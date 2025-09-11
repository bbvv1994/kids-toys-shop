import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// options: [{ value, label }]
// value: выбранное значение
// onChange: (value) => void
// label: подпись слева (например, 'Сортировать по:')
// width: ширина селектора (по умолчанию 160)
// sx: дополнительные стили
// labelSx: стили для подписи
export default function CustomSelect({ options, value, onChange, label, width = 160, sx = {}, menuWidth, menuSx = {}, labelSx = {}, disabled = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef();
  const menuRef = useRef();

  // Закрытие по клику вне
  useEffect(() => {
    if (!open || disabled) return;
    function handleClick(e) {
      // Проверяем, что клик не внутри основного элемента или меню
      if (rootRef.current && !rootRef.current.contains(e.target) && 
          menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, disabled]);

  // Клавиатура: Enter/Space — открыть, Esc — закрыть, стрелки — навигация
  useEffect(() => {
    if (!open || disabled) return;
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, disabled]);



  const selected = value ? options.find(o => o.value === value) : null;

  return (
    <Box ref={rootRef} sx={{ position: 'relative', width, zIndex: open ? 1000 : 'auto', contain: 'layout', isolation: 'isolate', ...sx }}>

      <Box
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen(o => !o)}
        onKeyDown={e => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) setOpen(o => !o);
        }}
                                     sx={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
             border: '1px solid rgba(0, 0, 0, 0.23)',
             borderRadius: '4px',
             px: 2,
             py: 1.5,
             minHeight: 40,
             background: disabled ? '#f5f5f5' : '#fff',
             fontWeight: 400,
             color: disabled ? 'rgba(0, 0, 0, 0.38)' : '#000',
             fontSize: '1rem',
             cursor: disabled ? 'default' : 'pointer',
             boxShadow: 'none',
             transition: 'all 0.2s',

             opacity: disabled ? 0.38 : 1,
             '&:hover': {
               borderColor: disabled ? 'rgba(0, 0, 0, 0.23)' : 'rgba(0, 0, 0, 0.87)'
             },
             '&:focus-within': {
               borderColor: '#1976d2',
               borderWidth: '2px'
             }
           }}
      >
        <span style={{ 
          flex: 1, 
          minWidth: 0, 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          color: selected ? '#000' : 'rgba(0, 0, 0, 0.6)'
        }}>
          {selected ? selected.label : label}
        </span>
        <KeyboardArrowDownIcon sx={{ 
          color: disabled ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.54)', 
          ml: 1, 
          fontSize: 20, 
          transition: 'transform 0.2s', 
          transform: open ? 'rotate(-180deg)' : 'none' 
        }} />
      </Box>
      {open && !disabled && (
                 <Box
           ref={menuRef}
           role="listbox"
           tabIndex={-1}
           onWheel={(e) => {
             // Предотвращаем закрытие меню при скролле внутри него
             e.stopPropagation();
           }}
           onTouchMove={(e) => {
             // Предотвращаем закрытие меню при touch скролле внутри него
             e.stopPropagation();
           }}
          sx={{
            position: 'absolute',
            left: 0,
            top: 'calc(100% + 4px)',
            width: menuWidth || width,
            background: '#fff',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: '4px',
            boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
            zIndex: 9999,
            maxHeight: 300,
            overflowY: 'auto',
            py: 0.5,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
                         // Улучшенные стили для скролла
             scrollbarWidth: 'thin',
             scrollbarColor: 'rgba(0, 0, 0, 0.3) transparent',
             '&::-webkit-scrollbar': {
               width: '8px',
               height: '8px',
             },
             '&::-webkit-scrollbar-track': {
               background: 'transparent',
               borderRadius: '4px',
             },
             '&::-webkit-scrollbar-thumb': {
               background: 'rgba(0, 0, 0, 0.3)',
               borderRadius: '4px',
               '&:hover': {
                 background: 'rgba(0, 0, 0, 0.5)',
               },
             },
             '&::-webkit-scrollbar-corner': {
               background: 'transparent',
             },
            ...menuSx
          }}
        >
          {options.map(opt => (
            <Box
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              sx={{
                px: 2,
                py: 1,
                fontWeight: opt.value === value ? 600 : 400,
                color: opt.value === value ? '#1976d2' : '#000',
                background: opt.value === value ? 'rgba(25, 118, 210, 0.08)' : 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background 0.15s',
                '&:hover': {
                  background: 'rgba(25, 118, 210, 0.12)'
                }
              }}
            >
              {opt.label}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
} 