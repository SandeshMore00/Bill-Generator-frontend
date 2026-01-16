# Quick Start Guide - API Configuration

## 🚀 Local Development (2 steps)

### Step 1: Set Backend URL
```bash
# Edit .env file
VITE_API_BASE_URL=http://13.83.89.57:9000
```

### Step 2: Run Dev Server
```bash
npm install
npm run dev
```

**Done!** Open http://localhost:5173

---

## ☁️ Cloudflare Pages Deployment (3 steps)

### Step 1: Set Environment Variable in Cloudflare
- Dashboard → Your Project → Settings → Environment Variables
- Add: `VITE_API_BASE_URL` = `http://13.83.89.57:9000`

### Step 2: Configure Build Settings
- **Build command:** `npm run build`
- **Build output directory:** `dist`

### Step 3: Deploy
- Push to Git (auto-deploys) or click "Retry deployment"

**Done!** Your app will use the backend URL from environment variable.

---

## 🧪 Test Before Deploy

```bash
# Build production version
npm run build

# Test production build locally
npm run preview
```

Open http://localhost:4173 and test invoice generation.

---

## 🔍 Troubleshooting

### "405 Method Not Allowed" in Production

**Cause:** Backend URL not set in Cloudflare Pages

**Fix:** 
1. Go to Cloudflare Pages → Settings → Environment Variables
2. Add `VITE_API_BASE_URL` with your backend URL
3. Trigger new deployment

### CORS Error

**Cause:** Backend doesn't allow your Cloudflare domain

**Fix:** Update backend CORS to include:
```
https://your-project.pages.dev
```

### Environment Variable Not Working

**Fix:**
1. Variable must be named exactly: `VITE_API_BASE_URL`
2. Restart dev server after changing `.env`
3. Redeploy on Cloudflare after adding env var

---

## 📚 More Info

- Full documentation: [API_CONFIGURATION.md](./API_CONFIGURATION.md)
- Deployment guide: [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

