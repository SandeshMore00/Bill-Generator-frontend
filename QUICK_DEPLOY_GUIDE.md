# Quick Deploy Guide

## 🎯 Current Configuration

**Backend URL:** `https://thepartykart.com`  
**API Endpoint:** `https://thepartykart.com/v1/bill/generate-invoice`  
**Method:** POST  
**Content-Type:** application/json  
**Response:** application/pdf

---

## ✅ What's Ready

- [x] Frontend code updated
- [x] API endpoint: `/v1/bill/generate-invoice`
- [x] Cache headers configured
- [x] Event delegation (no inline handlers)
- [x] Build successful
- [x] Environment variable configured locally

---

## 🚀 Deploy in 3 Steps

### Step 1: Set Cloudflare Environment Variable

1. Go to **Cloudflare Pages Dashboard**
2. Select your project
3. **Settings** → **Environment Variables**
4. Add:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://thepartykart.com`
   - **Environment:** Production ✅

### Step 2: Deploy Frontend

```bash
git add .
git commit -m "Update API endpoint to v1/bill/generate-invoice"
git push origin main
```

Cloudflare will auto-deploy.

### Step 3: Test Production

1. Open your Cloudflare Pages URL
2. Open DevTools → Console
3. Generate an invoice
4. **Should see:**
   ```
   [API Request] POST https://thepartykart.com/v1/bill/generate-invoice
   ```
5. PDF should download automatically

---

## 🧪 Quick Tests

### Test Backend (Before Deploy)

```bash
curl -I https://thepartykart.com/v1/bill/generate-invoice
```

**Expected:** 200 or 405 (if GET not allowed)

### Test Local Build

```bash
npm run build
npm run preview
```

Open http://localhost:4173 and test invoice generation.

---

## 📋 Backend Requirements

Your backend at `https://thepartykart.com/v1/bill/generate-invoice` must:

1. ✅ Accept POST requests
2. ✅ Return PDF as `application/pdf`
3. ✅ Include headers:
   ```
   Cache-Control: no-store, no-cache, must-revalidate, max-age=0
   Access-Control-Allow-Origin: * (or your domain)
   ```
4. ✅ Validate request data
5. ✅ Handle errors gracefully

---

## 🐛 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| **404 Not Found** | Verify backend has `/v1/bill/generate-invoice` endpoint |
| **CORS Error** | Add CORS headers to backend |
| **Calculations not updating** | Hard refresh (Ctrl+Shift+R) |
| **Wrong URL in console** | Check `VITE_API_BASE_URL` in Cloudflare |

---

## 📞 Support

**Documentation:**
- [API_ENDPOINT_UPDATE.md](./API_ENDPOINT_UPDATE.md) - Detailed changes
- [DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md) - Complete config guide
- [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md) - Backend setup

**Quick Test:**
```bash
# Test backend
curl -X POST https://thepartykart.com/v1/bill/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{"buyer_name":"Test","buyer_address":"Test Address","bill_no":"001","challan_no":"C001","date":"16-01-2026","vehicle_no":"","place_of_delivery":"Mumbai","loading_charge":100,"products":[{"description":"Test","hsn":"1234","quantity":1,"rate":100,"per":"Nos"}]}' \
  --output test.pdf
```

---

## ✨ Summary

✅ **API Endpoint:** `https://thepartykart.com/v1/bill/generate-invoice`  
✅ **Build Status:** Success (697ms)  
✅ **Frontend:** Ready to deploy  
⏳ **Action:** Set Cloudflare env var & deploy  

**Ready to go live!** 🚀

