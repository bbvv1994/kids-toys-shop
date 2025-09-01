module.exports = {
	apps: [
		{
			name: 'kids-toys-backend',
			script: 'src/index.js',
			env: {
				NODE_ENV: 'development',
				PORT: 5000
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: 5000
			},
			restart_delay: 5000,
			max_restarts: 10,
			exec_mode: 'fork',
			autorestart: true
		}
	]
};


