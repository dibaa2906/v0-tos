module.exports = {
  apps: [
    {
      name: 'intern-attendance-system',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/intern-attendance',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true
    }
  ]
}


