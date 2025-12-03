const path = require('path');

module.exports = {
  apps: [
    {
      name: 'intern-attendance-system',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: path.resolve(__dirname),
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0' // Listen on all network interfaces for production
      },
      error_file: path.resolve(__dirname, 'logs/pm2-error.log'),
      out_file: path.resolve(__dirname, 'logs/pm2-out.log'),
      log_file: path.resolve(__dirname, 'logs/pm2-combined.log'),
      time: true,
      merge_logs: true
    }
  ]
};


