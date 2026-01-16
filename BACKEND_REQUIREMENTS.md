# Backend Requirements for Production Deployment

## Critical: No-Cache Headers Required

Your backend at `http://13.83.89.57:9000` **MUST** return proper cache headers for the invoice generation endpoint.

---

## Required Headers

For the endpoint `/bill/generate-invoice`, add these response headers:

```http
Cache-Control: no-store, no-cache, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0
Content-Type: application/pdf
Access-Control-Allow-Origin: * (or your specific domain)
```

---

## Why This Is Critical

### Without These Headers:
- ❌ CDN caches invoice PDFs
- ❌ User A gets User B's invoice
- ❌ Data privacy violation
- ❌ Incorrect calculations displayed

### With These Headers:
- ✅ Every request hits backend
- ✅ Fresh calculations every time
- ✅ Correct user data
- ✅ No caching issues

---

## Implementation Examples

### Flask (Python)

```python
from flask import Flask, make_response, request
import io

app = Flask(__name__)

@app.after_request
def add_headers(response):
    """Add security and cache headers to all responses"""
    # No caching for dynamic content
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    # CORS (adjust origin as needed)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    return response

@app.route('/bill/generate-invoice', methods=['POST', 'OPTIONS'])
def generate_invoice():
    # Handle preflight
    if request.method == 'OPTIONS':
        return '', 204
    
    # Get request data
    data = request.get_json()
    
    # Validate data
    if not data or 'products' not in data:
        return {'error': 'Invalid request'}, 400
    
    # Generate PDF (your existing logic)
    pdf_bytes = generate_pdf_from_data(data)
    
    # Create response
    response = make_response(pdf_bytes)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename="invoice.pdf"'
    
    # Cache headers already added by after_request middleware
    return response

def generate_pdf_from_data(data):
    """Your existing PDF generation logic"""
    # ... your code here
    pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000)
```

### Express.js (Node.js)

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*', // or your specific domain
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// No-cache middleware
app.use((req, res, next) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    next();
});

// Invoice generation endpoint
app.post('/bill/generate-invoice', async (req, res) => {
    try {
        const data = req.body;
        
        // Validate
        if (!data || !data.products || data.products.length === 0) {
            return res.status(400).json({ error: 'Invalid request data' });
        }
        
        // Generate PDF (your existing logic)
        const pdfBuffer = await generatePDF(data);
        
        // Send response
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="invoice.pdf"'
        });
        
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
});

async function generatePDF(data) {
    // Your existing PDF generation logic
    // Return Buffer
}

app.listen(9000, '0.0.0.0', () => {
    console.log('Server running on port 9000');
});
```

### FastAPI (Python)

```python
from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or your specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# No-cache middleware
@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.post("/bill/generate-invoice")
async def generate_invoice(invoice_data: dict):
    """Generate invoice PDF from request data"""
    
    # Validate
    if not invoice_data or "products" not in invoice_data:
        raise HTTPException(status_code=400, detail="Invalid request data")
    
    if not invoice_data["products"]:
        raise HTTPException(status_code=400, detail="No products provided")
    
    try:
        # Generate PDF (your existing logic)
        pdf_bytes = generate_pdf_from_data(invoice_data)
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=invoice.pdf"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

def generate_pdf_from_data(data: dict) -> bytes:
    """Your existing PDF generation logic"""
    # ... your code here
    return pdf_bytes

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
```

---

## Testing Backend Headers

### 1. Test Locally

```bash
# Send test request
curl -X POST http://localhost:9000/bill/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_name": "Test",
    "buyer_address": "Test Address",
    "bill_no": "001",
    "challan_no": "C001",
    "date": "16-01-2026",
    "vehicle_no": "",
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
  -I  # Show headers only

# Should see:
# Cache-Control: no-store, no-cache, must-revalidate, max-age=0
# Pragma: no-cache
# Expires: 0
# Content-Type: application/pdf
```

### 2. Test Production

```bash
# Test your production backend
curl -X POST http://13.83.89.57:9000/bill/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{ ... same JSON ... }' \
  -I

# Verify headers are present
```

---

## CORS Configuration

If you get CORS errors in production, ensure backend allows your Cloudflare Pages domain:

### Flask
```python
from flask_cors import CORS

CORS(app, origins=[
    "https://your-project.pages.dev",
    "http://localhost:5173"
])
```

### Express.js
```javascript
app.use(cors({
    origin: [
        'https://your-project.pages.dev',
        'http://localhost:5173'
    ]
}));
```

### FastAPI
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-project.pages.dev",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)
```

---

## Validation Requirements

Backend should validate ALL fields:

```python
required_fields = [
    'buyer_name',
    'buyer_address',
    'bill_no',
    'challan_no',
    'date',
    'place_of_delivery',
    'products'
]

for field in required_fields:
    if field not in data or not data[field]:
        return {'error': f'{field} is required'}, 400

if not data['products'] or len(data['products']) == 0:
    return {'error': 'At least one product is required'}, 400

for i, product in enumerate(data['products']):
    if 'quantity' not in product or product['quantity'] <= 0:
        return {'error': f'Product {i+1}: quantity must be > 0'}, 400
    if 'rate' not in product or product['rate'] <= 0:
        return {'error': f'Product {i+1}: rate must be > 0'}, 400
```

---

## Calculation Logic (Must Match Frontend)

```python
def calculate_totals(products, loading_charge):
    """Calculate invoice totals - must match frontend exactly"""
    
    # Product total
    product_total = sum(p['quantity'] * p['rate'] for p in products)
    
    # Total amount = product_total + loading_charge
    total_amount = product_total + loading_charge
    
    # GST = 18%
    gst_amount = total_amount * 0.18
    
    # Final before rounding
    final_before_round = total_amount + gst_amount
    
    # Custom rounding (>0.50 rounds up)
    floor_value = int(final_before_round)
    decimal = final_before_round - floor_value
    
    if decimal > 0.50:
        rounded_final = floor_value + 1
    else:
        rounded_final = floor_value
    
    # Round off
    round_off = rounded_final - final_before_round
    
    # CGST and SGST
    cgst = gst_amount / 2
    sgst = gst_amount / 2
    
    return {
        'product_total': round(product_total, 2),
        'total_amount': round(total_amount, 2),
        'GST_amount': round(gst_amount, 2),
        'CGST': round(cgst, 2),
        'SGST': round(sgst, 2),
        'round_off': round(round_off, 2),
        'final_amount': rounded_final
    }
```

---

## Deployment Checklist

### Before Deploying Backend Changes:

- [ ] Add no-cache headers middleware
- [ ] Add CORS headers for Cloudflare domain
- [ ] Test headers with curl locally
- [ ] Validate all required fields
- [ ] Match calculation logic with frontend
- [ ] Handle errors gracefully
- [ ] Log requests for debugging

### After Deploying:

- [ ] Test backend directly (curl)
- [ ] Test from frontend production
- [ ] Check browser Network tab for headers
- [ ] Verify no "Hit" cache status
- [ ] Test multiple invoice generations
- [ ] Check calculations are correct

---

## Monitoring & Logging

Add logging to track issues:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/bill/generate-invoice', methods=['POST'])
def generate_invoice():
    logger.info(f"Invoice request: bill_no={data.get('bill_no')}")
    
    try:
        pdf_bytes = generate_pdf_from_data(data)
        logger.info(f"PDF generated successfully: {len(pdf_bytes)} bytes")
        return response
        
    except Exception as e:
        logger.error(f"PDF generation failed: {str(e)}")
        raise
```

---

## Support

If you encounter issues:

1. Check backend logs
2. Test headers with curl
3. Verify CORS configuration
4. Check calculation logic matches frontend
5. Review [CACHING_AND_CDN_GUIDE.md](./CACHING_AND_CDN_GUIDE.md)

---

## Summary

**Critical Changes Required:**
1. ✅ Add no-cache headers to `/bill/generate-invoice`
2. ✅ Add CORS headers for your domain
3. ✅ Validate all request data
4. ✅ Match calculation logic with frontend

**Test Command:**
```bash
curl -I http://13.83.89.57:9000/bill/generate-invoice
```

**Expected Output:**
```
Cache-Control: no-store, no-cache, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0
Content-Type: application/pdf
Access-Control-Allow-Origin: *
```

Deploy these changes and your production issues will be resolved! 🚀

