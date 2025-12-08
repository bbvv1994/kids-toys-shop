import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip } from '@mui/material';
import performanceLogger from '../utils/performanceLogger';

const PerformanceMonitor = () => {
  const [stats, setStats] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const interval = setInterval(() => {
        setStats(performanceLogger.getStats());
      }, 2000);

      return () => clearInterval(interval);
    }
  }, []);

  // Временно включено для диагностики на сервере
  // if (process.env.NODE_ENV === 'production') {
  //   return null;
  // }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        maxWidth: 300
      }}
    >
      <Button
        variant="contained"
        size="small"
        onClick={() => setIsVisible(!isVisible)}
        sx={{ mb: 1 }}
      >
        {isVisible ? 'Hide' : 'Show'} Perf
      </Button>
      
      {isVisible && (
        <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Performance Monitor
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              label={`Total: ${stats.total || 0}`} 
              color="primary" 
              size="small" 
            />
            <Chip 
              label={`setTimeout: ${stats.setTimeout || 0}`} 
              color="warning" 
              size="small" 
            />
            <Chip 
              label={`Messages: ${stats.message || 0}`} 
              color="error" 
              size="small" 
            />
            <Chip 
              label={`Reflows: ${stats.reflow || 0}`} 
              color="secondary" 
              size="small" 
            />
            <Chip 
              label={`Navigation: ${stats.navigation || 0}`} 
              color="info" 
              size="small" 
            />
            <Chip 
              label={`Renders: ${stats.render || 0}`} 
              color="success" 
              size="small" 
            />
          </Box>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => performanceLogger.clear()}
            sx={{ mr: 1 }}
          >
            Clear
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const logs = performanceLogger.getLogs();
              console.log('Performance Logs:', logs);
            }}
          >
            Export Logs
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default PerformanceMonitor;
