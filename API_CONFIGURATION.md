# API Configuration Guide

## Overview

The frontend now uses **environment variables** to configure the backend API URL, making it deployment-agnostic and production-ready for Cloudflare Pages.

---

## Environment Variables

### `.env` File (Local Development)

```env
VITE_API_BASE_URL=http://13.83.89.57:9000
```

### `.env.example` File (Template)

```env
# Backend API Base URL
# Copy this file to .env and update with your backend URL

# For local development
VITE_API_BASE_URL=http://localhost:9000

# For production (example)
# VITE_API_BASE_URL=http://13.83.89.57:9000
# VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## How It Works

### 1. API Helper Function

A reusable `apiRequest()` function handles all API calls:

```javascript
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    const config = {
        ...options,
        headers: {
            ...defaultOptions.headers
        }
    };
    
    try {
        console.log(`[API Request] ${config.method || 'GET'} ${url}`);
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API Error] ${response.status} ${response.statusText}:`, errorText);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else if (contentType && contentType.includes('application/pdf')) {
            return await response.blob();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error('[API Request Failed]:', error);
        throw error;
    }
}
```

**Features:**
- ✅ Automatic `Content-Type: application/json` header
- ✅ Intelligent response parsing (JSON, PDF Blob, Text)
- ✅ Comprehensive error handling with logging
- ✅ Response validation

### 2. API Base URL Configuration

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://13.83.89.57:9000';
```

**Fallback logic:**
1. First tries `VITE_API_BASE_URL` environment variable
2. Falls back to hardcoded URL if not set

### 3. Usage Example

**Old way (relative paths - doesn't work on Cloudflare):**
```javascript
const response = await fetch('/bill/generate-invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
```

**New way (environment-based - works everywhere):**
```javascript
const blob = await apiRequest('/bill/generate-invoice', {
    method: 'POST',
    body: JSON.stringify(data)
});
// blob is already parsed and ready to use!
```

---

## Local Development Setup

### Step 1: Create `.env` File

```bash
# Copy the example file
cp .env.example .env

# Or on Windows PowerShell
Copy-Item .env.example .env
```

### Step 2: Configure Backend URL

Edit `.env`:

```env
# For local backend
VITE_API_BASE_URL=http://localhost:9000

# OR for remote backend
VITE_API_BASE_URL=http://13.83.89.57:9000
```

### Step 3: Start Development Server

```bash
npm run dev
```

**Important:** Changes to `.env` require a dev server restart.

---

## Cloudflare Pages Production Setup

### Step 1: Set Environment Variable

1. Go to Cloudflare Pages Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add variable:
   - **Variable name:** `VITE_API_BASE_URL`
   - **Value:** `http://13.83.89.57:9000` (or your production backend URL)
   - **Environment:** Production (and Preview if needed)

### Step 2: Trigger Redeploy

After adding the environment variable:
- Trigger a new deployment (push to Git or manual redeploy)
- The new build will include your backend URL

### Step 3: Verify

Open browser console on your deployed site:
```javascript
// Should show your backend URL
console.log(import.meta.env.VITE_API_BASE_URL);
```

---

## CORS Configuration (Backend)

Your backend **must** allow requests from your Cloudflare Pages domain.

### Flask Example

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Allow Cloudflare Pages domain
CORS(app, origins=[
    "https://your-project.pages.dev",
    "http://localhost:5173"  # Vite dev server
])
```

### Express.js Example

```javascript
const cors = require('cors');

app.use(cors({
    origin: [
        'https://your-project.pages.dev',
        'http://localhost:5173'
    ]
}));
```

---

## Testing

### Test Local Build

```bash
# Build with .env variables
npm run build

# Preview production build
npm run preview
```

Open `http://localhost:4173` and test API calls.

### Test Production

1. Deploy to Cloudflare Pages
2. Open browser DevTools → Network tab
3. Click "Generate Invoice"
4. Verify:
   - Request goes to `http://13.83.89.57:9000/bill/generate-invoice`
   - Response is `200 OK`
   - Content-Type is `application/pdf`

---

## Troubleshooting

### ❌ Error: 405 Method Not Allowed

**Cause:** API endpoint doesn't support POST method or URL is wrong

**Fix:**
- Verify backend endpoint: `http://13.83.89.57:9000/bill/generate-invoice`
- Check backend logs for incoming requests
- Ensure method is `POST`

### ❌ Error: CORS policy blocked

**Cause:** Backend doesn't allow requests from your domain

**Fix:**
- Add Cloudflare Pages URL to backend CORS configuration
- Example: `https://your-project.pages.dev`

### ❌ Error: Network Error / Failed to Fetch

**Cause:** Backend is unreachable or URL is wrong

**Fix:**
- Test backend directly: `curl http://13.83.89.57:9000/health`
- Verify firewall allows incoming requests
- Check `VITE_API_BASE_URL` value in Cloudflare environment variables

### ⚠️ Environment variable not working

**Symptoms:** API calls still go to wrong URL

**Fix:**
1. Verify variable name is exactly `VITE_API_BASE_URL` (Vite requires `VITE_` prefix)
2. Restart dev server after changing `.env`
3. For Cloudflare Pages: trigger a new deployment after adding env var

### ⚠️ Works locally but not in production

**Most likely causes:**
1. Forgot to set `VITE_API_BASE_URL` in Cloudflare Pages
2. CORS not configured on backend
3. Backend URL not accessible from internet

**Debug steps:**
1. Check browser console for actual URL being called
2. Test backend URL directly in browser
3. Verify Cloudflare Pages environment variable is set

---

## Best Practices

### ✅ DO

- Always use `apiRequest()` helper function for consistency
- Set `VITE_API_BASE_URL` in Cloudflare Pages environment variables
- Keep `.env` file in `.gitignore` (already configured)
- Commit `.env.example` as a template
- Use full URLs for production (not relative paths)
- Test production build locally before deploying

### ❌ DON'T

- Don't hardcode backend URLs in code
- Don't commit `.env` file to Git
- Don't use relative paths (`/api/*`) on Cloudflare Pages
- Don't forget to restart dev server after `.env` changes
- Don't skip CORS configuration on backend

---

## Migration from Relative Paths

### Before (Proxy-based)

```javascript
// vite.config.js
proxy: {
  '/bill': {
    target: 'http://localhost:9000'
  }
}

// script.js
fetch('/bill/generate-invoice', { ... })
```

**Problem:** Cloudflare Pages doesn't support proxying

### After (Environment-based) ✅

```javascript
// .env
VITE_API_BASE_URL=http://13.83.89.57:9000

// script.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
apiRequest('/bill/generate-invoice', { ... })
```

**Benefit:** Works everywhere (local, Cloudflare, any static host)

---

## Security Notes

### Production Considerations

1. **HTTPS:** Use `https://` URLs in production
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```

2. **API Authentication:** Consider adding API keys
   ```javascript
   headers: {
       'X-API-Key': import.meta.env.VITE_API_KEY
   }
   ```

3. **Rate Limiting:** Implement on backend to prevent abuse

4. **Environment Variables:** Never expose sensitive keys in frontend
   - ✅ OK: API base URL
   - ❌ NOT OK: Private keys, database credentials

---

## Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
- [Fetch API MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

## Quick Reference

| Environment | VITE_API_BASE_URL | Where to Set |
|-------------|-------------------|--------------|
| **Local Dev** | `http://localhost:9000` | `.env` file |
| **Production** | `http://13.83.89.57:9000` | Cloudflare Pages Settings |
| **Staging** | `https://staging-api.example.com` | Cloudflare Preview Environment |

---

## Support

If you encounter issues:

1. Check browser console for error messages
2. Verify environment variable is set correctly
3. Test backend URL directly
4. Check CORS configuration
5. Review Cloudflare Pages build logs

