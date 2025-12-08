import React from 'react';
import { TextField } from '@mui/material';

export default function TestField() {
  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <TextField label="Тест" variant="outlined" fullWidth />
    </div>
  );
} 