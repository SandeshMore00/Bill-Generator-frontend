# Deployment Configuration

## Backend URL Configuration

**Production Backend:** `https://thepartykart.com`

---

## Environment Variables

### Local Development (`.env`)

```env
VITE_API_BASE_URL=https://thepartykart.com
```

### Cloudflare Pages Production

1. Go to: **Cloudflare Pages Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add variable:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://thepartykart.com`
   - **Environment:** Production ✅ (and Preview if needed)

---

## API Endpoint

The frontend will make requests to:

```
https://thepartykart.com/v1/bill/generate-invoice
```

**Method:** POST  
**Content-Type:** application/json  
**Expected Response:** application/pdf

---

## Testing Backend Connectivity

### 1. Test Backend Directly

```bash
# Test if backend is accessible
curl -I https://thepartykart.com/v1/bill/generate-invoice

# Should return 200 or 405 (if GET not allowed)
```

### 2. Test with Sample Data

```bash
curl -X POST https://thepartykart.com/v1/bill/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_name": "Test Client",
    "buyer_address": "Test Address Line 1, Test City, State - 123456",
    "bill_no": "TEST001",
    "challan_no": "CH001",
    "date": "16-01-2026",
    "vehicle_no": "MH01AB1234",
    "place_of_delivery": "Mumbai",
    "loading_charge": 100,
    "products": [
      {
        "description": "Test Product",
        "hsn": "1234",
        "quantity": 1,
        "rate": 100,
        "per": "Nos"
      }
    ]
  }' \
  --output test-invoice.pdf

# Should download a PDF file
```

### 3. Verify Response Headers

```bash
curl -I -X POST https://thepartykart.com/v1/bill/generate-invoice \
  -H "Content-Type: application/json"

# Check for:
# - Cache-Control: no-store, no-cache, must-revalidate, max-age=0
# - Content-Type: application/pdf
# - Access-Control-Allow-Origin: * (or your domain)
```

---

## CORS Configuration

Since your frontend is on Cloudflare Pages and backend is `thepartykart.com`, ensure backend allows CORS requests from your frontend domain.

### Required Backend CORS Headers

```http
Access-Control-Allow-Origin: https://your-project.pages.dev
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

**Or allow all origins (less secure):**

```http
Access-Control-Allow-Origin: *
```

---

## Local Development

### Option 1: Direct Connection (Recommended)

Your `.env` is already configured:

```env
VITE_API_BASE_URL=https://thepartykart.com
```

Just run:

```bash
npm run dev
```

Frontend will connect directly to `https://thepartykart.com`.

### Option 2: Using Proxy (Optional)

If you need to proxy requests through Vite dev server, uncomment in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/v1': {
      target: 'https://thepartykart.com',
      changeOrigin: true,
      secure: true
    }
  }
}
```

Then update `.env` to use relative path:

```env
VITE_API_BASE_URL=
```

---

## Deployment Checklist

### Frontend (Cloudflare Pages)

- [x] `.env` updated with `https://thepartykart.com`
- [x] `script.js` fallback updated
- [x] Build successful
- [ ] Set environment variable in Cloudflare Pages dashboard
- [ ] Deploy to Cloudflare Pages
- [ ] Test invoice generation in production

### Backend (thepartykart.com)

- [ ] Endpoint `/v1/bill/generate-invoice` accepts POST requests
- [ ] Returns PDF as `application/pdf`
- [ ] Includes no-cache headers:
  - `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`
  - `Pragma: no-cache`
  - `Expires: 0`
- [ ] Includes CORS headers for your frontend domain
- [ ] Validates all required fields
- [ ] Handles errors gracefully

---

## Troubleshooting

### ❌ Error: "CORS policy blocked"

**Symptoms:**
```
Access to fetch at 'https://thepartykart.com/v1/bill/generate-invoice' 
from origin 'https://your-project.pages.dev' has been blocked by CORS policy
```

**Fix:**
Add CORS headers to backend at `thepartykart.com`:

```python
# Flask
from flask_cors import CORS
CORS(app, origins=["https://your-project.pages.dev"])

# Express
app.use(cors({
    origin: 'https://your-project.pages.dev'
}));
```

### ❌ Error: "Failed to fetch"

**Symptoms:**
- Network error in console
- Request doesn't reach backend

**Check:**
1. Backend is running and accessible
2. No firewall blocking requests
3. SSL certificate is valid (for HTTPS)
4. Test with curl directly

**Test:**
```bash
curl https://thepartykart.com/v1/bill/generate-invoice
```

### ❌ Error: "405 Method Not Allowed"

**Cause:** Backend doesn't accept POST method

**Fix:**
Ensure backend route accepts POST:

```python
# Flask
@app.route('/v1/bill/generate-invoice', methods=['POST', 'OPTIONS'])

# Express
app.post('/v1/bill/generate-invoice', ...)
```

### ⚠️ Wrong Backend URL in Production

**Symptoms:**
- Frontend tries to connect to wrong URL
- API calls go to `http://localhost:9000`

**Fix:**
1. Verify `VITE_API_BASE_URL` is set in Cloudflare Pages environment variables
2. Redeploy frontend after adding environment variable
3. Hard refresh browser (Ctrl+Shift+R)

**Check in browser console:**
```javascript
// Should log: https://thepartykart.com/v1/bill/generate-invoice
console.log('[API Request] POST https://thepartykart.com/v1/bill/generate-invoice');
```

---

## Security Considerations

### 1. Use HTTPS (Already Configured ✅)

```
✅ https://thepartykart.com
❌ http://thepartykart.com
```

### 2. Validate SSL Certificate

```bash
# Check SSL certificate
curl -vI https://thepartykart.com
```

### 3. Implement Rate Limiting (Backend)

Prevent abuse by limiting requests per IP:

```python
# Flask example
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["100 per hour"]
)

@app.route('/bill/generate-invoice', methods=['POST'])
@limiter.limit("10 per minute")
def generate_invoice():
    # ...
```

### 4. Add API Authentication (Optional)

For additional security:

```javascript
// Frontend
const response = await apiRequest('/bill/generate-invoice', {
    method: 'POST',
    headers: {
        'X-API-Key': import.meta.env.VITE_API_KEY
    },
    body: JSON.stringify(data)
});
```

---

## Production URLs

| Environment | Frontend URL | Backend URL |
|-------------|--------------|-------------|
| **Local Dev** | `http://localhost:5173` | `https://thepartykart.com` |
| **Production** | `https://your-project.pages.dev` | `https://thepartykart.com` |
| **API Endpoint** | - | `https://thepartykart.com/v1/bill/generate-invoice` |

---

## Quick Start Commands

### Development

```bash
# Run dev server
npm run dev

# Test backend connectivity
curl -I https://thepartykart.com/v1/bill/generate-invoice
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy (push to Git)
git add .
git commit -m "Update backend URL to thepartykart.com"
git push origin main
```

---

## Monitoring

### Check Logs in Production

1. **Frontend Logs:** Browser DevTools → Console
   ```
   [API Request] POST https://thepartykart.com/v1/bill/generate-invoice
   [API Request] Response received: 200 OK
   ```

2. **Backend Logs:** Check your backend server logs for:
   - Incoming requests
   - Request body validation
   - PDF generation success/failure
   - Error messages

### Test Invoice Generation

1. Open production site
2. Fill in all fields
3. Add at least one product
4. Click "Generate Invoice"
5. **Expected behavior:**
   - Console shows: `[API Request] POST https://thepartykart.com/v1/bill/generate-invoice`
   - PDF downloads automatically
   - Filename: `{Client Name} {Bill No}.pdf`

---

## Support

**Backend Issues:**
- Verify backend is running: `curl https://thepartykart.com`
- Check backend logs for errors
- Test endpoint with curl/Postman
- Verify CORS headers

**Frontend Issues:**
- Check browser console for errors
- Verify environment variable in Cloudflare Pages
- Hard refresh browser
- Test in incognito mode

**Documentation:**
- [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md) - Backend setup
- [CACHING_AND_CDN_GUIDE.md](./CACHING_AND_CDN_GUIDE.md) - CDN configuration
- [API_CONFIGURATION.md](./API_CONFIGURATION.md) - Environment variables
- [PRODUCTION_FIX_SUMMARY.md](./PRODUCTION_FIX_SUMMARY.md) - Recent fixes

---

## Summary

✅ **Frontend configured to use:** `https://thepartykart.com`  
✅ **API endpoint:** `https://thepartykart.com/v1/bill/generate-invoice`  
✅ **Local development ready**  
⏳ **Set environment variable in Cloudflare Pages**  
⏳ **Verify backend CORS and no-cache headers**  

**Next step:** Deploy and test! 🚀

