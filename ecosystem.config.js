module.exports = {
  apps: [
    {
      name: 'intern-attendance-system',
      script: 'node_modules/.bin/next',
      args: process.env.NODE_ENV === 'production' ? 'start' : 'dev',
      cwd: process.env.APP_PATH || process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
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
