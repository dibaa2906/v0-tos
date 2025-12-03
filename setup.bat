@echo off
echo 🚀 Setting up Intern Attendance System...
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build the application
echo 🔨 Building the application for production...
call npm run build

REM Create logs directory
echo 📁 Creating logs directory...
if not exist "logs" mkdir logs

REM Start with PM2
echo 🎯 Starting the application with PM2...
call npx pm2 start ecosystem.config.js

REM Save PM2 configuration
echo 💾 Saving PM2 configuration...
call npx pm2 save

echo.
echo ✅ Setup complete!
echo.
echo 📝 Useful commands:
echo   - View status: npx pm2 status
echo   - View logs: npx pm2 logs
echo   - Restart: npx pm2 restart ecosystem.config.js
echo   - Stop: npx pm2 stop ecosystem.config.js
echo.
echo 🌐 Your application is running at: http://localhost:3000
echo.

pause


