# Login Troubleshooting Guide

## Current Status

The login API is working correctly when tested with curl. The issue appears to be related to cookie handling in Safari.

## What We've Fixed

1. ✅ Added detailed logging to login API
2. ✅ Made username lookup case-insensitive
3. ✅ Improved error handling
4. ✅ Changed PM2 config to development mode
5. ⚠️ Cookie Secure flag issue persists (Safari blocks secure cookies on HTTP)

## How to Test Login

### Test Credentials
- **Admin**: username: `admin`, password: `adminpass1`
- **User**: username: `wanadiba2906`, password: `Azma5016.`
- **User**: username: `aisyah123`, password: `Aisyah123`

### Steps to Debug

1. **Open Safari Developer Tools**:
   - Press `Cmd + Option + I` (or Safari > Develop > Show Web Inspector)
   - Go to the Console tab

2. **Try to log in** and watch the console for:
   - `🚀 Login attempt started`
   - `📡 Calling API...`
   - `📥 Response received:`
   - `📦 Response data:`
   - `✅ Login successful` or `❌ Login failed`

3. **Check the Network tab**:
   - Look for the `/api/auth/login` request
   - Check the response status (should be 200)
   - Check the response body (should have `success: true`)

4. **Check Server Logs**:
   ```bash
   npm run pm2:logs
   ```
   Look for:
   - `🔐 Login attempt:`
   - `👤 User lookup:`
   - `🔑 Password check:`
   - `✅ Login successful` or error messages

## Common Issues

### Issue 1: "Invalid username or password"
- **Check**: Username and password are case-sensitive
- **Solution**: Make sure you're using the exact credentials
- **Check logs**: Look for password mismatch in server logs

### Issue 2: Login succeeds but redirects back to login
- **Cause**: Middleware can't read cookies (Safari blocking Secure cookies)
- **Solution**: The app uses localStorage, so this shouldn't happen. Check if localStorage is being set correctly.

### Issue 3: JavaScript errors in console
- **Check**: Open Safari Developer Tools Console
- **Look for**: Red error messages
- **Common causes**: CORS issues, network errors, JavaScript errors

### Issue 4: Cookies not being set
- **Cause**: Safari blocking Secure cookies on HTTP
- **Current workaround**: App uses localStorage for authentication
- **Note**: Middleware still checks cookies, but frontend uses localStorage

## Manual Testing

Test the API directly:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass1"}'
```

Should return:
```json
{"success":true,"user":{...}}
```

## Next Steps

If login still doesn't work:

1. **Check Safari Console** for JavaScript errors
2. **Check Server Logs** for login attempts
3. **Verify credentials** are correct (case-sensitive)
4. **Try a different browser** (Chrome/Firefox) to see if it's Safari-specific
5. **Clear Safari cache and cookies**:
   - Safari > Preferences > Privacy > Manage Website Data
   - Remove localhost data
   - Try again

## Cookie Issue (Known)

Safari blocks cookies with the `Secure` flag on HTTP connections. The app currently:
- Sets cookies (for middleware)
- Uses localStorage (for frontend auth)

The middleware checks cookies, but if they're blocked, the frontend localStorage should still work. If you're being redirected, it might be the middleware blocking access.

## Temporary Workaround

If cookies are the issue, you can temporarily modify the middleware to be less strict, or rely entirely on localStorage (which requires modifying the middleware to check headers instead of cookies).


