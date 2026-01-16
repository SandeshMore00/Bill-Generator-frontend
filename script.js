// ==========================================
// API Configuration
// ==========================================
// Uses environment variable for backend URL
// Set VITE_API_BASE_URL in .env file or Cloudflare Pages environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://thepartykart.com';

// API Helper Function
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

// Company data
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
    },
    pmsprings: {
        name: 'P M SPRINGS AND SPARES',
        address: 'Address: - 304/D Shree Complex Plot No 106/112, Sector-14, Kamothe Navi Mumbai\nGSTIN: - 27AAUFP4820H1ZV\nState Name: - Maharashtra\nState Code : - 27'
    },
    bhushan: {
        name: 'BHUSHAN LOGISTICS PVT LTD',
        address: 'Address: - PANVEL, Raigad, Maharashtra, 410207\nGSTIN: - 27AADCB5175B1ZY\nState Name: - Maharashtra\nState Code : - 27'
    },
    jagadhatri: {
        name: 'MAA JAGADHATRI ENGINEERING WORKS',
        address: 'Address: - Steel Market, Plot No-1420/1421, Kalamboli, Navi Mumbai, Raigad, Maharashtra, 410218\nGSTIN: - 27AINPD3464G1Z8\nState Name: - Maharashtra\nState Code : - 27'
    },
    amit: {
        name: 'AMIT AUTO PARTS',
        address: 'Address: - 1ST FLOOR, G WING, FLAT NO. 101, Star Complex Cooperative Housing Society Nagaon Road, Anganwadi, Mhatawali, Uran, Navi Mumbai, Raigad, Maharashtra, 400702\nGSTIN: - 27ACHFA4532A1ZW\nState Name: - Maharashtra\nState Code : - 27'
    },
    asp: {
        name: 'ASP ENGINEERING WORKS',
        address: 'Address: - Plot No. 1628, Road No. 19, Steel Market, Kalamboli, Navi Mumbai - 410218\nGSTIN: - 27BRVPN6699DIZU\nState Name: - Maharashtra\nState Code : - 27'
    },
    vikas: {
        name: 'VIKAS AUTOMOBILES & ENGINEERINGS',
        address: 'Address: - Building No./Flat No.: Plot No. B-40, Maharashtra Industrial Development Corporation, Mangaon Road, Vile Bhagad, Mangaon, Shirawali Tarf Nijampur, Raigad, Maharashtra, 402120\nGSTIN: - 27AAZFV1589L1ZZ\nState Name: - Maharashtra\nState Code : - 27'
    },
    geoservices: {
        name: 'Geoservices Maritime Pvt. Ltd.',
        address: 'Address: - Zion, Office No 1301 to 1310, Plot No 273, Sector 10, Kharghar, Navi Mumbai - 410210, Maharashtra, India\nGSTIN: - 27AAFCG4191E1ZN\nState Name: - Maharashtra\nState Code : - 27'
    },
    sai: {
        name: 'SAI TRAILERS',
        address: 'Address: - Road No-21 Plot No-1719, Steel Market KWC Kalamboli, Raigad\nGSTIN: - 27BTAPB4367H1ZU\nState Name: - Maharashtra\nState Code : - 27'
    }
};

// Initialize application on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize bill generator directly
    initializeBillGenerator();
});

function initializeBillGenerator() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('billDate').value = today;
    
    // Add first item row
    addItemRow();
    
    // Event listeners
    document.getElementById('companySelect').addEventListener('change', handleCompanySelect);
    document.getElementById('addItemBtn').addEventListener('click', addItemRow);
    document.getElementById('generateBtn').addEventListener('click', generateInvoice);
    document.getElementById('resetBtn').addEventListener('click', resetForm);
    document.getElementById('loadingCharge').addEventListener('input', calculateTotals);
    
    // Event delegation for dynamically added product inputs
    // This ensures calculations work even if JS is cached or loaded async
    const itemsList = document.getElementById('itemsList');
    itemsList.addEventListener('input', function(e) {
        const target = e.target;
        
        // Check if the input is a product field that affects amount calculation
        if (target.matches('.item-quantity, .item-rate, .item-description, .item-hsn')) {
            const productBox = target.closest('.product-box');
            if (productBox) {
                const id = productBox.id.replace('item-', '');
                calculateItemAmount(id);
            }
        }
    });
    
    // Event delegation for per (unit) dropdown changes
    itemsList.addEventListener('change', function(e) {
        if (e.target.matches('.item-per')) {
            const productBox = e.target.closest('.product-box');
            if (productBox) {
                const id = productBox.id.replace('item-', '');
                calculateItemAmount(id);
            }
        }
    });
    
    // Event delegation for remove buttons
    itemsList.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.btn-remove');
        if (removeBtn) {
            const productBox = removeBtn.closest('.product-box');
            if (productBox) {
                const id = productBox.id.replace('item-', '');
                removeItem(id);
            }
        }
    });
}

function handleCompanySelect(e) {
    const selectedValue = e.target.value;
    const otherFields = document.getElementById('otherCompanyFields');
    const selectedInfo = document.getElementById('selectedCompanyInfo');
    const companyName = document.getElementById('companyName');
    const companyAddress = document.getElementById('companyAddress');
    const clientName = document.getElementById('clientName');
    const clientAddress = document.getElementById('clientAddress');
    
    if (selectedValue === 'other') {
        otherFields.style.display = 'block';
        selectedInfo.style.display = 'none';
        companyName.value = '';
        companyAddress.value = '';
    } else if (selectedValue && COMPANIES[selectedValue]) {
        otherFields.style.display = 'none';
        selectedInfo.style.display = 'block';
        companyName.value = COMPANIES[selectedValue].name;
        companyAddress.value = COMPANIES[selectedValue].address;
    } else {
        otherFields.style.display = 'none';
        selectedInfo.style.display = 'none';
        companyName.value = '';
        companyAddress.value = '';
    }
}

let itemCount = 0;

function addItemRow() {
    itemCount++;
    const itemsList = document.getElementById('itemsList');
    const itemRow = document.createElement('div');
    itemRow.className = 'product-box';
    itemRow.id = `item-${itemCount}`;
    
    // No inline event handlers - using event delegation for better caching/CSP compatibility
    itemRow.innerHTML = `
        <div class="product-box-header">
            <h4>Product ${itemCount}</h4>
            <button type="button" class="btn-remove" data-item-id="${itemCount}" aria-label="Remove item">×</button>
        </div>
        <div class="product-box-body">
            <div class="product-field-row">
                <label class="product-label" for="item-name-${itemCount}">Name :</label>
                <input type="text" id="item-name-${itemCount}" class="item-description" placeholder="Enter Product Name" data-item-id="${itemCount}">
            </div>
            <div class="product-field-row">
                <label class="product-label" for="item-hsn-${itemCount}">HSN :</label>
                <input type="text" id="item-hsn-${itemCount}" class="item-hsn" placeholder="Enter HSN Code" data-item-id="${itemCount}">
            </div>
            <div class="product-field-row">
                <label class="product-label" for="item-quantity-${itemCount}">Quantity :</label>
                <input type="number" id="item-quantity-${itemCount}" class="item-quantity" placeholder="0" min="0" step="0.01" value="1" data-item-id="${itemCount}">
            </div>
            <div class="product-field-row">
                <label class="product-label" for="item-rate-${itemCount}">Rate :</label>
                <input type="number" id="item-rate-${itemCount}" class="item-rate" placeholder="0.00" min="0" step="0.01" value="0" data-item-id="${itemCount}">
            </div>
            <div class="product-field-row">
                <label class="product-label" for="item-per-${itemCount}">Per :</label>
                <select id="item-per-${itemCount}" class="item-per" data-item-id="${itemCount}">
                    <option value="Kg">Kg</option>
                    <option value="Nos" selected>Nos</option>
                </select>
            </div>
            <div class="product-field-row product-amount-row">
                <label class="product-label">Amount :</label>
                <span class="item-amount" id="item-amount-${itemCount}">₹0.00</span>
            </div>
        </div>
    `;
    
    itemsList.appendChild(itemRow);
    calculateTotals();
}

function removeItem(id) {
    const itemRow = document.getElementById(`item-${id}`);
    if (itemRow) {
        itemRow.remove();
        calculateTotals();
    }
}

function calculateItemAmount(id) {
    const itemRow = document.getElementById(`item-${id}`);
    if (!itemRow) {
        console.warn(`[calculateItemAmount] Item row not found: item-${id}`);
        return;
    }
    
    const quantityInput = itemRow.querySelector('.item-quantity');
    const rateInput = itemRow.querySelector('.item-rate');
    
    if (!quantityInput || !rateInput) {
        console.error(`[calculateItemAmount] Missing inputs for item-${id}`);
        return;
    }
    
    const quantity = parseFloat(quantityInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const amount = quantity * rate;
    
    const amountElement = document.getElementById(`item-amount-${id}`);
    if (amountElement) {
        amountElement.textContent = formatCurrency(amount);
        console.log(`[calculateItemAmount] Item ${id}: ${quantity} × ${rate} = ${amount}`);
    } else {
        console.error(`[calculateItemAmount] Amount element not found: item-amount-${id}`);
    }
    
    calculateTotals();
}

// Custom rounding function (matches backend exactly)
function customRound(value) {
    const floorValue = Math.floor(value);
    const decimal = value - floorValue;
    
    if (decimal > 0.50) {
        return floorValue + 1;
    } else {
        return floorValue;
    }
}

function calculateTotals() {
    console.log('[calculateTotals] Starting calculation...');
    
    // Calculate product total
    let productTotal = 0;
    const productBoxes = document.querySelectorAll('.product-box');
    
    productBoxes.forEach((row, index) => {
        const quantityInput = row.querySelector('.item-quantity');
        const rateInput = row.querySelector('.item-rate');
        
        if (quantityInput && rateInput) {
            const quantity = parseFloat(quantityInput.value) || 0;
            const rate = parseFloat(rateInput.value) || 0;
            const itemTotal = quantity * rate;
            productTotal += itemTotal;
            console.log(`  Product ${index + 1}: ${quantity} × ${rate} = ${itemTotal}`);
        }
    });
    
    // Get loading charge
    const loadingCharge = parseFloat(document.getElementById('loadingCharge').value) || 0;
    console.log(`  Loading Charge: ${loadingCharge}`);
    
    // Total amount = product_total + loading_charge
    const totalAmount = productTotal + loadingCharge;
    console.log(`  Product Total: ${productTotal}, Total Amount: ${totalAmount}`);
    
    // GST_amount = total_amount × 0.18
    const gstAmount = totalAmount * 0.18;
    
    // final_before_round = total_amount + GST_amount
    const finalBeforeRound = totalAmount + gstAmount;
    
    // Apply custom rounding
    const roundedFinal = customRound(finalBeforeRound);
    
    // round_off = rounded_final - final_before_round
    const roundOff = roundedFinal - finalBeforeRound;
    
    // CGST = GST_amount / 2
    // SGST = GST_amount / 2
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    
    // Update UI
    document.getElementById('productTotal').textContent = formatCurrency(productTotal);
    document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('gstAmount').textContent = formatCurrency(gstAmount);
    document.getElementById('cgst').textContent = formatCurrency(cgst);
    document.getElementById('sgst').textContent = formatCurrency(sgst);
    // Show round off with sign
    const roundOffDisplay = roundOff >= 0 ? '+' + formatCurrency(roundOff) : formatCurrency(roundOff);
    document.getElementById('roundOff').textContent = roundOffDisplay;
    document.getElementById('finalAmount').textContent = formatCurrency(roundedFinal);
}

function formatCurrency(amount) {
    return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
}

// Format date as DD-MM-YYYY for API
function formatDateForAPI(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Validation function for invoice data
function validateInvoiceData(data) {
    const errors = [];
    
    // Validate buyer_name
    if (!data.buyer_name || typeof data.buyer_name !== 'string' || data.buyer_name.trim().length < 2) {
        errors.push('Buyer name is required and must be at least 2 characters long');
    }
    
    // Validate buyer_address
    if (!data.buyer_address || typeof data.buyer_address !== 'string' || data.buyer_address.trim().length < 10) {
        errors.push('Buyer address is required and must be at least 10 characters long');
    }
    
    // Validate bill_no
    if (!data.bill_no || typeof data.bill_no !== 'string' || data.bill_no.trim().length === 0) {
        errors.push('Bill number is required');
    }
    
    // Validate challan_no
    if (!data.challan_no || typeof data.challan_no !== 'string' || data.challan_no.trim().length === 0) {
        errors.push('Challan number is required');
    }
    
    // Validate date
    if (!data.date || typeof data.date !== 'string' || data.date.trim().length === 0) {
        errors.push('Date is required');
    } else {
        // Validate date format (DD-MM-YYYY)
        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        if (!dateRegex.test(data.date)) {
            errors.push('Date must be in DD-MM-YYYY format');
        }
    }
    
    // Validate vehicle_no (can be empty but must exist as string)
    if (data.vehicle_no === undefined || data.vehicle_no === null) {
        errors.push('Vehicle number field is required (can be empty)');
    }
    
    // Validate place_of_delivery
    if (!data.place_of_delivery || typeof data.place_of_delivery !== 'string' || data.place_of_delivery.trim().length === 0) {
        errors.push('Place of delivery is required');
    }
    
    // Validate loading_charge
    if (data.loading_charge === undefined || data.loading_charge === null) {
        errors.push('Loading charge is required (can be 0)');
    } else if (typeof data.loading_charge !== 'number' || isNaN(data.loading_charge) || data.loading_charge < 0) {
        errors.push('Loading charge must be a valid number (0 or greater)');
    }
    
    // Validate products array
    if (!Array.isArray(data.products) || data.products.length === 0) {
        errors.push('At least one product is required');
    } else {
        // Validate each product
        data.products.forEach((product, index) => {
            const productNum = index + 1;
            
            // Validate description
            if (!product.description || typeof product.description !== 'string' || product.description.trim().length === 0) {
                errors.push(`Product ${productNum}: Description is required`);
            }
            
            // Validate hsn
            if (!product.hsn || typeof product.hsn !== 'string' || product.hsn.trim().length === 0) {
                errors.push(`Product ${productNum}: HSN code is required`);
            }
            
            // Validate quantity
            if (product.quantity === undefined || product.quantity === null || typeof product.quantity !== 'number' || isNaN(product.quantity) || product.quantity <= 0) {
                errors.push(`Product ${productNum}: Quantity must be a number greater than 0`);
            }
            
            // Validate rate
            if (product.rate === undefined || product.rate === null || typeof product.rate !== 'number' || isNaN(product.rate) || product.rate <= 0) {
                errors.push(`Product ${productNum}: Rate must be a number greater than 0`);
            }
            
            // Validate per
            if (!product.per || typeof product.per !== 'string' || product.per.trim().length === 0) {
                errors.push(`Product ${productNum}: Unit (Per) is required`);
            }
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function generateInvoice() {
    // Get company/client info
    const companySelect = document.getElementById('companySelect').value;
    let name, address;
    
    if (companySelect === 'other') {
        name = document.getElementById('clientName').value.trim();
        address = document.getElementById('clientAddress').value.trim();
    } else if (companySelect && COMPANIES[companySelect]) {
        name = COMPANIES[companySelect].name;
        address = COMPANIES[companySelect].address;
    } else {
        alert('Please select a company');
        return;
    }
    
    // Get bill details - trim all text values
    const billNo = document.getElementById('billNo').value.trim();
    const challanNo = document.getElementById('challanNo').value.trim();
    const date = document.getElementById('billDate').value;
    const vehicleNo = document.getElementById('vehicleNo').value.trim();
    const placeOfDelivery = document.getElementById('placeOfDelivery').value.trim();
    
    // Get products - validate each product
    const productDetails = [];
    const productBoxes = document.querySelectorAll('.product-box');
    let validationError = null;
    
    for (let index = 0; index < productBoxes.length; index++) {
        const row = productBoxes[index];
        const description = row.querySelector('.item-description').value.trim();
        const hsn = row.querySelector('.item-hsn').value.trim();
        const quantityInput = row.querySelector('.item-quantity').value.trim();
        const rateInput = row.querySelector('.item-rate').value.trim();
        const per = row.querySelector('.item-per').value || 'Nos';
        
        // Skip completely empty products (no data entered at all)
        const isEmpty = !description && !hsn && !quantityInput && !rateInput;
        if (isEmpty) {
            continue; // Skip this empty product
        }
        
        // Product has some data, so validate all required fields
        const quantity = parseFloat(quantityInput);
        const rate = parseFloat(rateInput);
        
        // Validate product data
        if (!description || description.length === 0) {
            validationError = `Product ${index + 1}: Name is required`;
            break;
        }
        if (!hsn || hsn.length === 0) {
            validationError = `Product ${index + 1}: HSN code is required`;
            break;
        }
        if (isNaN(quantity) || quantity <= 0) {
            validationError = `Product ${index + 1}: Quantity must be greater than 0`;
            break;
        }
        if (isNaN(rate) || rate <= 0) {
            validationError = `Product ${index + 1}: Rate must be greater than 0`;
            break;
        }
        if (!per || per.trim().length === 0) {
            validationError = `Product ${index + 1}: Unit (Per) is required`;
            break;
        }
        
        productDetails.push({
            description: description,
            hsn: hsn,
            quantity: quantity,
            rate: rate,
            per: per.trim()
        });
    }
    
    // Check for validation errors
    if (validationError) {
        alert(validationError);
        return;
    }
    
    if (productDetails.length === 0) {
        alert('Please add at least one valid product with all required fields');
        return;
    }
    
    // Get loading charge - convert to number
    const loadingChargeInput = document.getElementById('loadingCharge').value.trim();
    const loadingCharge = loadingChargeInput ? parseFloat(loadingChargeInput) : 0;
    
    if (isNaN(loadingCharge) || loadingCharge < 0) {
        alert('Loading charge must be a valid number (0 or greater)');
        return;
    }
    
    // Validate date
    if (!date) {
        alert('Date is required');
        return;
    }
    
    // Format date for API
    const formattedDate = formatDateForAPI(date);
    
    // Build JSON for API with all required fields
    const apiInvoiceData = {
        buyer_name: name.trim(),
        buyer_address: address.trim(),
        bill_no: billNo,
        challan_no: challanNo,
        date: formattedDate,
        vehicle_no: vehicleNo, // Can be empty string
        place_of_delivery: placeOfDelivery,
        loading_charge: loadingCharge,
        products: productDetails.map(item => ({
            description: item.description.trim(),
            hsn: item.hsn.trim(),
            quantity: item.quantity,
            rate: item.rate,
            per: item.per
        }))
    };
    
    // Validate the complete invoice data
    const validation = validateInvoiceData(apiInvoiceData);
    
    if (!validation.isValid) {
        // Show all validation errors
        const errorMessage = 'Please fix the following errors:\n\n' + validation.errors.join('\n');
        alert(errorMessage);
        return; // Block API call
    }
    
    // Calculate totals (same logic as calculateTotals)
    let productTotal = 0;
    productDetails.forEach(item => {
        productTotal += item.quantity * item.rate;
    });
    
    const totalAmount = productTotal + loadingCharge;
    const gstAmount = totalAmount * 0.18;
    const finalBeforeRound = totalAmount + gstAmount;
    const roundedFinal = customRound(finalBeforeRound);
    const roundOff = roundedFinal - finalBeforeRound;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    
    // Build JSON for display (with totals)
    const invoiceData = {
        name: name,
        address: address,
        bill_no: billNo,
        challan_no: challanNo,
        date: date,
        vehicle_no: vehicleNo,
        place_of_delivery: placeOfDelivery,
        product_details: productDetails,
        loading_charge: loadingCharge,
        totals: {
            product_total: parseFloat(productTotal.toFixed(2)),
            total_amount: parseFloat(totalAmount.toFixed(2)),
            GST_amount: parseFloat(gstAmount.toFixed(2)),
            CGST: parseFloat(cgst.toFixed(2)),
            SGST: parseFloat(sgst.toFixed(2)),
            round_off: parseFloat(roundOff.toFixed(2)),
            final_amount: roundedFinal
        }
    };
    
    // Store JSON for download
    window.invoiceJson = invoiceData;
    window.apiInvoiceData = apiInvoiceData;
    
    // Display JSON
    document.getElementById('jsonContent').textContent = JSON.stringify(apiInvoiceData, null, 2);
    document.getElementById('jsonOutput').style.display = 'block';
    
    // Generate preview
    generatePreview(invoiceData);
    
    // Auto-download PDF from backend API (only if validation passed)
    downloadInvoice(apiInvoiceData, name, billNo);
    
    // Scroll to JSON
    document.getElementById('jsonOutput').scrollIntoView({ behavior: 'smooth' });
}

function generatePreview(data) {
    let productsHTML = '';
    data.product_details.forEach(item => {
        productsHTML += `
            <tr>
                <td>${item.description || '-'}</td>
                <td>${item.hsn || '-'}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.rate)}</td>
                <td>${item.per}</td>
                <td>${formatCurrency(item.quantity * item.rate)}</td>
            </tr>
        `;
    });
    
    const previewHTML = `
        <div class="bill-header">
            <div class="bill-info">
                <h2>INVOICE</h2>
                <div class="bill-number">Bill #: ${data.bill_no}</div>
                <div class="bill-number">Challan #: ${data.challan_no || '-'}</div>
            </div>
            <div>
                <p><strong>Date:</strong> ${formatDate(data.date)}</p>
                <p><strong>Vehicle No:</strong> ${data.vehicle_no || '-'}</p>
                <p><strong>Place of Delivery:</strong> ${data.place_of_delivery || '-'}</p>
            </div>
        </div>
        
        <div class="bill-details">
            <div class="bill-section">
                <h3>Bill To:</h3>
                <p><strong>${data.name}</strong></p>
                <p>${data.address.replace(/\n/g, '<br>')}</p>
            </div>
        </div>
        
        <table class="bill-items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>HSN</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Per</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${productsHTML}
            </tbody>
        </table>
        
        <div class="bill-totals">
            <div class="bill-totals-row">
                <span class="bill-totals-label">Product Total:</span>
                <span>${formatCurrency(data.totals.product_total)}</span>
            </div>
            <div class="bill-totals-row">
                <span class="bill-totals-label">Loading Charge:</span>
                <span>${formatCurrency(data.loading_charge)}</span>
            </div>
            <div class="bill-totals-row">
                <span class="bill-totals-label">Total Amount:</span>
                <span>${formatCurrency(data.totals.total_amount)}</span>
            </div>
            <div class="bill-totals-row">
                <span class="bill-totals-label">GST (18%):</span>
                <span>${formatCurrency(data.totals.GST_amount)}</span>
            </div>
            <div class="bill-totals-row">
                <span class="bill-totals-label">CGST (9%):</span>
                <span>${formatCurrency(data.totals.CGST)}</span>
            </div>
            <div class="bill-totals-row">
                <span class="bill-totals-label">SGST (9%):</span>
                <span>${formatCurrency(data.totals.SGST)}</span>
            </div>
            <div class="bill-totals-row">
                <span class="bill-totals-label">Round Off:</span>
                <span>${data.totals.round_off >= 0 ? '+' + formatCurrency(data.totals.round_off) : formatCurrency(data.totals.round_off)}</span>
            </div>
            <div class="bill-totals-row total">
                <span class="bill-totals-label">Final Payable Amount:</span>
                <span>${formatCurrency(data.totals.final_amount)}</span>
            </div>
        </div>
    `;
    
    document.getElementById('billPreview').innerHTML = previewHTML;
    document.getElementById('previewSection').style.display = 'block';
}

function downloadJson() {
    if (!window.invoiceJson) {
        alert('Please generate invoice first');
        return;
    }
    
    const dataStr = JSON.stringify(window.invoiceJson, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${window.invoiceJson.bill_no || 'invoice'}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Helper function to sanitize filename (keeps spaces, removes special chars)
function sanitizeFilename(name) {
    return name.replace(/[<>:"/\\|?*]/g, '').trim();
}

// Download invoice PDF from backend API
async function downloadInvoice(invoiceData, buyerName, billNo) {
    // Final validation check before API call
    const validation = validateInvoiceData(invoiceData);
    if (!validation.isValid) {
        const errorMessage = 'Validation failed before API call:\n\n' + validation.errors.join('\n');
        alert(errorMessage);
        return;
    }
    
    try {
        // Ensure all fields are properly formatted and sanitized
        const sanitizedData = {
            buyer_name: String(invoiceData.buyer_name).trim(),
            buyer_address: String(invoiceData.buyer_address).trim(),
            bill_no: String(invoiceData.bill_no).trim(),
            challan_no: String(invoiceData.challan_no).trim(),
            date: String(invoiceData.date).trim(),
            vehicle_no: String(invoiceData.vehicle_no || '').trim(),
            place_of_delivery: String(invoiceData.place_of_delivery).trim(),
            loading_charge: Number(invoiceData.loading_charge) || 0,
            products: invoiceData.products.map(product => ({
                description: String(product.description).trim(),
                hsn: String(product.hsn).trim(),
                quantity: Number(product.quantity),
                rate: Number(product.rate),
                per: String(product.per).trim()
            }))
        };
        
        // apiRequest returns the blob directly after handling response
        const blob = await apiRequest('/v1/bill/generate-invoice', {
            method: 'POST',
            body: JSON.stringify(sanitizedData)
        });
        
        // Verify blob is valid
        if (!blob || blob.size === 0) {
            throw new Error('Received empty response from server');
        }
        
        const url = window.URL.createObjectURL(blob);

        // Get client name and bill number for filename
        const clientName = sanitizeFilename(buyerName);
        const fileName = `${clientName} ${billNo}.pdf`;

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        // Clean up the URL
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading invoice:', error);
        let errorMessage = 'Error generating invoice. ';
        
        if (error.message.includes('HTTP error')) {
            errorMessage += error.message;
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Unable to connect to server. Please check your connection and try again.';
        } else {
            errorMessage += error.message || 'Please try again or contact support.';
        }
        
        alert(errorMessage);
    }
}

// Generate and download PDF (kept for fallback, but not used by default)
function downloadPDF(data) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Get client name and bill number for filename (format: "clientname billno.pdf")
        const clientName = sanitizeFilename(data.name);
        const billNo = sanitizeFilename(data.bill_no);
        const fileName = `${clientName} ${billNo}.pdf`;
        
        // Set font
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', 105, 20, { align: 'center' });
        
        let yPos = 35;
        
        // Bill details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Bill No: ${data.bill_no}`, 20, yPos);
        doc.text(`Challan No: ${data.challan_no || '-'}`, 20, yPos + 5);
        doc.text(`Date: ${formatDate(data.date)}`, 20, yPos + 10);
        doc.text(`Vehicle No: ${data.vehicle_no || '-'}`, 20, yPos + 15);
        doc.text(`Place of Delivery: ${data.place_of_delivery || '-'}`, 20, yPos + 20);
        
        yPos += 30;
        
        // Client info
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        const addressLines = data.address.split('\n');
        addressLines.forEach((line, index) => {
            doc.text(line, 20, yPos + 5 + (index * 5));
        });
        
        yPos += addressLines.length * 5 + 15;
        
        // Products table
        doc.setFont('helvetica', 'bold');
        doc.text('Products:', 20, yPos);
        yPos += 10;
        
        // Table headers
        doc.setFontSize(9);
        doc.text('Description', 20, yPos);
        doc.text('HSN', 60, yPos);
        doc.text('Qty', 90, yPos);
        doc.text('Rate', 110, yPos);
        doc.text('Per', 130, yPos);
        doc.text('Amount', 150, yPos);
        
        yPos += 5;
        doc.line(20, yPos, 190, yPos);
        yPos += 5;
        
        // Product rows
        doc.setFont('helvetica', 'normal');
        data.product_details.forEach(item => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(item.description || '-', 20, yPos);
            doc.text(item.hsn || '-', 60, yPos);
            doc.text(item.quantity.toString(), 90, yPos);
            doc.text(formatCurrency(item.rate).replace('₹', ''), 110, yPos);
            doc.text(item.per, 130, yPos);
            doc.text(formatCurrency(item.quantity * item.rate).replace('₹', ''), 150, yPos);
            yPos += 7;
        });
        
        yPos += 5;
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        // Totals
        doc.setFont('helvetica', 'bold');
        doc.text('Product Total:', 120, yPos);
        doc.text(formatCurrency(data.totals.product_total), 150, yPos);
        yPos += 7;
        
        doc.text('Loading Charge:', 120, yPos);
        doc.text(formatCurrency(data.loading_charge), 150, yPos);
        yPos += 7;
        
        doc.text('Total Amount:', 120, yPos);
        doc.text(formatCurrency(data.totals.total_amount), 150, yPos);
        yPos += 7;
        
        doc.text('GST (18%):', 120, yPos);
        doc.text(formatCurrency(data.totals.GST_amount), 150, yPos);
        yPos += 7;
        
        doc.text('CGST (9%):', 120, yPos);
        doc.text(formatCurrency(data.totals.CGST), 150, yPos);
        yPos += 7;
        
        doc.text('SGST (9%):', 120, yPos);
        doc.text(formatCurrency(data.totals.SGST), 150, yPos);
        yPos += 7;
        
        doc.text('Round Off:', 120, yPos);
        const roundOffText = data.totals.round_off >= 0 ? '+' + formatCurrency(data.totals.round_off) : formatCurrency(data.totals.round_off);
        doc.text(roundOffText, 150, yPos);
        yPos += 7;
        
        doc.setFontSize(12);
        doc.text('Final Payable Amount:', 120, yPos);
        doc.text(formatCurrency(data.totals.final_amount), 150, yPos);
        
        // Save PDF
        doc.save(fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Generate and download DOC file
function downloadDOC(data) {
    try {
        // Get client name and bill number for filename (format: "clientname billno.doc")
        const clientName = sanitizeFilename(data.name);
        const billNo = sanitizeFilename(data.bill_no);
        const fileName = `${clientName} ${billNo}.doc`;
        
        // Create HTML content for DOC
        let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { text-align: center; color: #667eea; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #667eea; color: white; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { font-weight: bold; font-size: 1.2em; }
    </style>
</head>
<body>
    <h1>INVOICE</h1>
    
    <div>
        <p><strong>Bill No:</strong> ${data.bill_no}</p>
        <p><strong>Challan No:</strong> ${data.challan_no || '-'}</p>
        <p><strong>Date:</strong> ${formatDate(data.date)}</p>
        <p><strong>Vehicle No:</strong> ${data.vehicle_no || '-'}</p>
        <p><strong>Place of Delivery:</strong> ${data.place_of_delivery || '-'}</p>
    </div>
    
    <div style="margin: 20px 0;">
        <h3>Bill To:</h3>
        <p><strong>${data.name}</strong></p>
        <pre style="white-space: pre-wrap; font-family: Arial;">${data.address}</pre>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>HSN</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Per</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
`;
        
        data.product_details.forEach(item => {
            htmlContent += `
            <tr>
                <td>${item.description || '-'}</td>
                <td>${item.hsn || '-'}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.rate)}</td>
                <td>${item.per}</td>
                <td>${formatCurrency(item.quantity * item.rate)}</td>
            </tr>
`;
        });
        
        htmlContent += `
        </tbody>
    </table>
    
    <div class="totals">
        <p><strong>Product Total:</strong> ${formatCurrency(data.totals.product_total)}</p>
        <p><strong>Loading Charge:</strong> ${formatCurrency(data.loading_charge)}</p>
        <p><strong>Total Amount:</strong> ${formatCurrency(data.totals.total_amount)}</p>
        <p><strong>GST (18%):</strong> ${formatCurrency(data.totals.GST_amount)}</p>
        <p><strong>CGST (9%):</strong> ${formatCurrency(data.totals.CGST)}</p>
        <p><strong>SGST (9%):</strong> ${formatCurrency(data.totals.SGST)}</p>
        <p><strong>Round Off:</strong> ${data.totals.round_off >= 0 ? '+' + formatCurrency(data.totals.round_off) : formatCurrency(data.totals.round_off)}</p>
        <p class="total-row"><strong>Final Payable Amount:</strong> ${formatCurrency(data.totals.final_amount)}</p>
    </div>
</body>
</html>
`;
        
        // Create blob and download
        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating DOC:', error);
        alert('Error generating DOC. Please try again.');
    }
}

function printBill() {
    window.print();
}

function resetForm() {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
        document.getElementById('companySelect').value = '';
        document.getElementById('clientName').value = '';
        document.getElementById('clientAddress').value = '';
        document.getElementById('billNo').value = '';
        document.getElementById('challanNo').value = '';
        document.getElementById('vehicleNo').value = '';
        document.getElementById('placeOfDelivery').value = '';
        document.getElementById('loadingCharge').value = '0';
        
        // Reset date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('billDate').value = today;
        
        // Clear items
        document.getElementById('itemsList').innerHTML = '';
        itemCount = 0;
        addItemRow();
        
        // Hide sections
        document.getElementById('otherCompanyFields').style.display = 'none';
        document.getElementById('selectedCompanyInfo').style.display = 'none';
        document.getElementById('jsonOutput').style.display = 'none';
        document.getElementById('previewSection').style.display = 'none';
        
        calculateTotals();
    }
}


