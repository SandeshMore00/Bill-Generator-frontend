// Hardcoded credentials
const CORRECT_USERNAME = '9224381321';
const CORRECT_PASSWORD = '9224381321';

// Company data
const COMPANIES = {
    vijay: {
        name: 'Vijay Laxmi Engineering',
        address: 'M/S: - Vijay Laxmi Engineering\nAddress: - GRD, H996, H996, OPP INDIABULLS COMPLEX, KON, KON.PANVEL, Raigad,\nMaharashtra, 410207\nGSTIN: - 27ACBPG2352G2Z0\nState Name: - Maharashtra\nState Code : - 27'
    },
    pearl: {
        name: 'Pearl Auto Springs',
        address: 'M/S: - Pearl Auto Springs\nAddress: - Shop No- 36, Truck Terminal\nNear Libra Weight Bridge Kalamboli\nNavi Mumbai\nGSTIN: - 27ABFFP2282B1ZG\nState Name: - Maharashtra\nState Code : - 27'
    },
    rajesh: {
        name: 'Rajesh Cargo Movers(INDIA)Private Limited',
        address: 'M/S: - Rajesh Cargo Movers(INDIA)Private Limited\nAddress: - Kalamboli.\nGSTIN: - 27AAGCR8316K1ZZ\nState Name: - Maharashtra\nState Code : - 27'
    },
    yash: {
        name: 'Shri Yash Roadways',
        address: 'M/S: - Shri Yash Roadways\nAddress: - Steel Chembar A Wing,\n317, Kalamboli, PANVEL, Raigad,\nMaharashtra, 410207\nGSTIN: - 27AALPU0368C1ZL\nState Name: - Maharashtra\nState Code : - 27'
    }
};

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        showMainApp();
    } else {
        showLogin();
    }
    
    // Login form handler
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    
    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
        // Correct credentials
        errorMessage.style.display = 'none';
        sessionStorage.setItem('isLoggedIn', 'true');
        showMainApp();
    } else {
        // Wrong credentials
        errorMessage.style.display = 'block';
        document.getElementById('password').value = '';
        document.getElementById('username').focus();
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('isLoggedIn');
        showLogin();
        // Clear form
        document.getElementById('loginForm').reset();
        document.getElementById('errorMessage').style.display = 'none';
    }
}

function showLogin() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Initialize bill generator
    initializeBillGenerator();
}

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
    itemRow.className = 'item-row';
    itemRow.id = `item-${itemCount}`;
    
    itemRow.innerHTML = `
        <div class="item-row-first">
            <div class="item-field-group">
                <label class="item-label">Name -</label>
                <input type="text" class="item-description" placeholder="Name" oninput="calculateItemAmount(${itemCount})">
            </div>
            <div class="item-field-group">
                <label class="item-label">HSN -</label>
                <input type="text" class="item-hsn" placeholder="HSN" oninput="calculateItemAmount(${itemCount})">
            </div>
            <div class="item-field-group">
                <label class="item-label">Quantity -</label>
                <input type="number" class="item-quantity" placeholder="Qty" min="0" step="0.01" value="1" oninput="calculateItemAmount(${itemCount})">
            </div>
        </div>
        <div class="item-row-second">
            <div class="item-field-group">
                <label class="item-label">Rate -</label>
                <input type="number" class="item-rate" placeholder="Rate" min="0" step="0.01" value="0" oninput="calculateItemAmount(${itemCount})">
            </div>
            <div class="item-field-group">
                <label class="item-label">Per -</label>
                <select class="item-per" onchange="calculateItemAmount(${itemCount})">
                    <option value="Kg">Kg</option>
                    <option value="Nos" selected>Nos</option>
                </select>
            </div>
        </div>
        <div class="item-field-group">
            <label class="item-label">Amount -</label>
            <span class="item-amount" id="item-amount-${itemCount}">₹0.00</span>
        </div>
        <button type="button" class="btn-remove" onclick="removeItem(${itemCount})">Remove</button>
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
    if (!itemRow) return;
    
    const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
    const rate = parseFloat(itemRow.querySelector('.item-rate').value) || 0;
    const amount = quantity * rate;
    
    const amountElement = document.getElementById(`item-amount-${id}`);
    if (amountElement) {
        amountElement.textContent = formatCurrency(amount);
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
    // Calculate product total
    let productTotal = 0;
    document.querySelectorAll('.item-row').forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        productTotal += quantity * rate;
    });
    
    // Get loading charge
    const loadingCharge = parseFloat(document.getElementById('loadingCharge').value) || 0;
    
    // Total amount = product_total + loading_charge
    const totalAmount = productTotal + loadingCharge;
    
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
    
    // Get bill details
    const billNo = document.getElementById('billNo').value.trim();
    const challanNo = document.getElementById('challanNo').value.trim();
    const date = document.getElementById('billDate').value;
    const vehicleNo = document.getElementById('vehicleNo').value.trim();
    const placeOfDelivery = document.getElementById('placeOfDelivery').value.trim();
    
    if (!billNo || !date) {
        alert('Please fill in Bill No and Date');
        return;
    }
    
    // Get products
    const productDetails = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const description = row.querySelector('.item-description').value.trim();
        const hsn = row.querySelector('.item-hsn').value.trim();
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const per = row.querySelector('.item-per').value || 'Nos';
        
        if (description || hsn || quantity > 0 || rate > 0) {
            productDetails.push({
                description: description || '',
                hsn: hsn || '',
                quantity: quantity,
                rate: rate,
                per: per
            });
        }
    });
    
    if (productDetails.length === 0) {
        alert('Please add at least one product');
        return;
    }
    
    // Get loading charge
    const loadingCharge = parseFloat(document.getElementById('loadingCharge').value) || 0;
    
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
    
    // Build JSON for API (matching backend format)
    const apiInvoiceData = {
        buyer_name: name,
        bill_no: billNo,
        challan_no: challanNo || '',
        date: formatDateForAPI(date),
        vehicle_no: vehicleNo || '',
        place_of_delivery: placeOfDelivery || '',
        loading_charge: loadingCharge,
        products: productDetails.map(item => ({
            description: item.description || '',
            hsn: item.hsn || '',
            quantity: item.quantity,
            rate: item.rate,
            per: item.per || 'Nos'
        }))
    };
    
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
    
    // Auto-download PDF from backend API
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
    try {
        const response = await fetch("http://localhost:20000/generate-invoice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(invoiceData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
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
        alert('Error generating invoice. Please check if the backend server is running on http://localhost:20000');
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


