module.exports = {
  apps : [{
    name: 'kids-toys-backend',
    script: 'src/index.js',
    instances: 1,  // Уменьшили с 'max' до 1
    exec_mode: 'fork',  // Изменили с 'cluster' на 'fork'
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',  // Уменьшили с 1G до 200M
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
