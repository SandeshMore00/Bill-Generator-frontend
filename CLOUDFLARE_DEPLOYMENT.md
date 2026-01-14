# Cloudflare Pages Deployment Guide

## Build Settings

Configure these settings in your Cloudflare Pages project:

### Build Configuration
- **Framework preset**: `None` (or `Vite`)
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty)
- **Node version**: `18` or higher

### Environment Variables (if needed)
No environment variables required for frontend.

## What Was Fixed

### 1. Updated `_redirects` File
The original `_redirects` had:
```
/* /index.html 200
```

This caught ALL requests including static files like `script.js`, causing them to return `index.html` instead of the actual JavaScript.

**Fixed** to exclude static assets:
```
# Don't redirect static assets
/assets/*  200
/*.js  200
/*.css  200
# ... other static file types

# SPA fallback
/*  /index.html  200
```

### 2. Updated `vite.config.js`
Added build configuration to output files to `dist` directory with proper asset handling:
- Output directory: `dist`
- Assets directory: `assets` (with content hashing)
- Proper rollup configuration for chunking

### 3. Updated `index.html`
Changed script tag from:
```html
<script src="script.js"></script>
```

To:
```html
<script type="module" src="/script.js"></script>
```

This tells Vite to treat it as an ES module entry point.

## Deployment Steps

### First Time Setup

1. **Connect Repository to Cloudflare Pages**
   - Go to Cloudflare Dashboard > Pages
   - Click "Create a project"
   - Connect your Git repository
   - Select the repository and branch

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: (leave empty)

3. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete

### Subsequent Deployments

After pushing changes to your repository:
- Cloudflare Pages will automatically detect the push
- Build will start automatically
- New version will be deployed once build succeeds

## Local Testing

Before deploying, test the production build locally:

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

Then open `http://localhost:4173` and verify everything works.

## Troubleshooting

### Script not loading (MIME type error)
- Verify `_redirects` file is in `public/` directory
- Ensure build output is in `dist/` directory
- Check Cloudflare Pages build logs for errors

### API calls failing
- Verify backend URL in production
- Check CORS settings on backend
- Update proxy target if needed (proxy only works in dev mode)

### Build failing
- Check Node version in Cloudflare Pages settings
- Ensure all dependencies are in `package.json`
- Review build logs for specific errors

## Production vs Development

### Development (`npm run dev`)
- Uses Vite dev server
- Proxy configured for `/bill/*` → backend
- Hot module replacement enabled

### Production (Cloudflare Pages)
- Static files served from CDN
- No proxy (API calls go directly to backend)
- Optimized and minified assets

