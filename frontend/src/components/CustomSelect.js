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
export default function CustomSelect({ options, value, onChange, label, width = 160, sx = {}, menuWidth, menuSx = {}, labelSx = {} }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef();
  const menuRef = useRef();

  // Закрытие по клику вне
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Клавиатура: Enter/Space — открыть, Esc — закрыть, стрелки — навигация
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Прокрутка — закрывать меню
  useEffect(() => {
    if (!open) return;
    function handleScroll() { setOpen(false); }
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <Box ref={rootRef} sx={{ position: 'relative', width, ...sx }}>
      {label && (
        <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#222', mr: 1, mb: 0.5, ...labelSx }}>{label}</Typography>
      )}
      <Box
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(o => !o);
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #e3f2fd',
          borderRadius: 2,
          px: 2,
          py: 1,
          minHeight: 36,
          background: '#fff',
          fontWeight: 700,
          color: '#ff6600',
          fontSize: 16,
          cursor: 'pointer',
          boxShadow: open ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
          transition: 'box-shadow 0.2s',
          outline: open ? '2px solid #ff6600' : 'none',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected ? selected.label : ''}</span>
        <KeyboardArrowDownIcon sx={{ color: '#ff6600', ml: 1, fontSize: 22, transition: 'transform 0.2s', transform: open ? 'rotate(-180deg)' : 'none' }} />
      </Box>
      {open && (
        <Box
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          sx={{
            position: 'absolute',
            left: 0,
            top: 'calc(100% + 4px)',
            width: menuWidth || width,
            background: '#fff',
            border: '1px solid #e3f2fd',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 10,
            maxHeight: 320,
            overflowY: 'auto',
            py: 0.5,
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
                fontWeight: opt.value === value ? 700 : 400,
                color: opt.value === value ? '#ff6600' : '#222',
                background: opt.value === value ? 'rgba(255,102,0,0.08)' : 'none',
                cursor: 'pointer',
                fontSize: 16,
                transition: 'background 0.15s',
                '&:hover': {
                  background: 'rgba(255,102,0,0.12)'
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