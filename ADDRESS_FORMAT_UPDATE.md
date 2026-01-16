# Buyer Address Format Update

**Date:** January 16, 2026  
**Change:** Removed company name from buyer address field

---

## 🔄 What Changed

### Before (Included Company Name)
```
M/S: - Pearl Auto Springs
Address: - Shop No- 36, Truck Terminal
Near Libra Weight Bridge Kalamboli
Navi Mumbai
GSTIN: - 27ABFFP2282B1ZG
State Name: - Maharashtra
State Code : - 27
```

### After (Address Only) ✅
```
Address: - Shop No- 36, Truck Terminal
Near Libra Weight Bridge Kalamboli
Navi Mumbai
GSTIN: - 27ABFFP2282B1ZG
State Name: - Maharashtra
State Code : - 27
```

---

## 📝 Updated Companies

### 1. Vijay Laxmi Engineering
**Name:** Vijay Laxmi Engineering  
**Address:**
```
Address: - GRD, H996, H996, OPP INDIABULLS COMPLEX, KON, KON.PANVEL, Raigad,
Maharashtra, 410207
GSTIN: - 27ACBPG2352G2Z0
State Name: - Maharashtra
State Code : - 27
```

### 2. Pearl Auto Springs
**Name:** Pearl Auto Springs  
**Address:**
```
Address: - Shop No- 36, Truck Terminal
Near Libra Weight Bridge Kalamboli
Navi Mumbai
GSTIN: - 27ABFFP2282B1ZG
State Name: - Maharashtra
State Code : - 27
```

### 3. Rajesh Cargo Movers(INDIA)Private Limited
**Name:** Rajesh Cargo Movers(INDIA)Private Limited  
**Address:**
```
Address: - Kalamboli.
GSTIN: - 27AAGCR8316K1ZZ
State Name: - Maharashtra
State Code : - 27
```

### 4. Shri Yash Roadways
**Name:** Shri Yash Roadways  
**Address:**
```
Address: - Steel Chembar A Wing,
317, Kalamboli, PANVEL, Raigad,
Maharashtra, 410207
GSTIN: - 27AALPU0368C1ZL
State Name: - Maharashtra
State Code : - 27
```

---

## 📁 File Modified

**`script.js`** - Updated COMPANIES object:

```javascript
const COMPANIES = {
    vijay: {
        name: 'Vijay Laxmi Engineering',
        address: 'Address: - GRD, H996, H996, OPP INDIABULLS COMPLEX, KON, KON.PANVEL, Raigad,\nMaharashtra, 410207\nGSTIN: - 27ACBPG2352G2Z0\nState Name: - Maharashtra\nState Code : - 27'
    },
    pearl: {
        name: 'Pearl Auto Springs',
        address: 'Address: - Shop No- 36, Truck Terminal\nNear Libra Weight Bridge Kalamboli\nNavi Mumbai\nGSTIN: - 27ABFFP2282B1ZG\nState Name: - Maharashtra\nState Code : - 27'
    },
    rajesh: {
        name: 'Rajesh Cargo Movers(INDIA)Private Limited',
        address: 'Address: - Kalamboli.\nGSTIN: - 27AAGCR8316K1ZZ\nState Name: - Maharashtra\nState Code : - 27'
    },
    yash: {
        name: 'Shri Yash Roadways',
        address: 'Address: - Steel Chembar A Wing,\n317, Kalamboli, PANVEL, Raigad,\nMaharashtra, 410207\nGSTIN: - 27AALPU0368C1ZL\nState Name: - Maharashtra\nState Code : - 27'
    }
};
```

---

## ✅ Build Status

```bash
npm run build
```

**Result:** ✅ Success
```
dist/index.html                  6.91 kB │ gzip: 1.56 kB
dist/assets/index.DGJIBodv.css  17.42 kB │ gzip: 3.67 kB
dist/assets/index.D-EcH6Yh.js   18.28 kB │ gzip: 5.31 kB
✓ built in 1.30s
```

---

## 🧪 Testing

### Test Locally

1. Run dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. Select a company from dropdown

4. **Verify:** Address field shows only address (no "M/S: - Company Name" line)

5. Generate invoice and check PDF

---

## 📊 Impact

| Field | Before | After |
|-------|--------|-------|
| **Company Name** | Unchanged | Unchanged |
| **Buyer Address** | Includes "M/S: - {name}" | Only address details ✅ |
| **PDF Output** | Name in address | Name separate from address ✅ |

---

## 🎯 Result

**Before:**
```
Buyer Name: Pearl Auto Springs
Buyer Address:
  M/S: - Pearl Auto Springs          ← Removed ✅
  Address: - Shop No- 36, Truck Terminal
  Near Libra Weight Bridge Kalamboli
  Navi Mumbai
  GSTIN: - 27ABFFP2282B1ZG
  State Name: - Maharashtra
  State Code : - 27
```

**After:**
```
Buyer Name: Pearl Auto Springs
Buyer Address:
  Address: - Shop No- 36, Truck Terminal
  Near Libra Weight Bridge Kalamboli
  Navi Mumbai
  GSTIN: - 27ABFFP2282B1ZG
  State Name: - Maharashtra
  State Code : - 27
```

---

## 🚀 Deployment

### Deploy to Cloudflare Pages

```bash
git add .
git commit -m "Remove company name from buyer address field"
git push origin main
```

Cloudflare will auto-deploy.

---

## ✨ Summary

✅ **Removed:** "M/S: - {Company Name}" line from all buyer addresses  
✅ **Kept:** All other address details (Address, GSTIN, State, etc.)  
✅ **Build:** Successful  
✅ **Impact:** Cleaner address format in invoices  

**Status:** Ready to deploy! 🚀

