# RIVIGO Document Testing Guide

## Document Details from Sample Image

From the RIVIGO document you provided, I can see the following key information:

### Document Structure:
- **Company**: RIVIGO by Mahindra Logistics
- **Document Type**: Mill Express Services Delivery Receipt
- **Docket Number**: **3001823710** (shown in barcode and text)

### Shipper Details (From):
- **Company**: Eicher Motors Limited (EICHR)
- **Address**: Royal Enfield, 39 Hide Road, Near Jainkunj Maidan Kolkata, West Bengal - 700043

### Receiver Details (To):
- **Company**: NDG Motors Private Limited  
- **Address**: H No - 6, Ground Floor, Bab Shop Area, R.road, Jharkhana - 831001

### Package Information:
- **Number of Boxes**: 85
- **Actual Weight**: 222 kg
- **Contents**: Auto parts
- **Delivery Date**: May 13, 2025 (Est.)
- **Booking Date**: May 07, 2025

### Additional Details:
- **GSTIN/PAN**: 19AAACE3882D1ZP
- **Invoice Number**: 255231699
- **E-way Bill**: 851526271123
- **Invoice Value**: 225837 INR

### Signatures & Stamps:
- Document contains handwritten signatures in the "Proof of Delivery" section
- Official stamp appears to be present
- Handwritten comments visible

## Testing Setup

I have already configured the system with:

1. **Claude API Key**: Configured in `.env.local` 
2. **Test Parcel**: Added parcel with ID `3001823710` to match the document
3. **Enhanced Extraction**: Updated prompts to better extract RIVIGO format data

## Expected Extraction Results

When you upload this RIVIGO document, the system should extract:

```json
{
  "docketNumber": "3001823710",
  "invoiceNumber": "255231699", 
  "ewayBillNumber": "851526271123",
  "receiverName": "NDG Motors Private Limited",
  "numberOfBoxes": 85,
  "actualWeight": "222 kg",
  "receiverAddress": "H No - 6, Ground Floor, Bab Shop Area, R.road, Jharkhana - 831001",
  "signatureStatus": "Signature Present",
  "stampStatus": "Available",
  "damageComments": "Any handwritten delivery notes/comments",
  "consignorName": "Eicher Motors Limited",
  "consignorAddress": "Royal Enfield, 39 Hide Road, Near Jainkunj Maidan Kolkata, West Bengal - 700043",
  "gstin": "19AAACE3882D1ZP"
}
```

## How to Test

### Step 1: Start Development Server
```bash
cd /path/to/parcel-ocr-system
pnpm dev
```

### Step 2: Access Application
- Open http://localhost:3002 (or the port shown in terminal)

### Step 3: Upload the RIVIGO Document
1. Click **"Upload POD"** button
2. You should see API status indicator:
   - 🟢 Green: "Claude API Connected - Real PDF extraction enabled"
   - 🔴 Red: "Claude API Failed - Using mock data for testing"
3. Drag and drop your RIVIGO PDF file or click "Browse Files"
4. Name the file `3001823710.pdf` (matching the docket number)
5. Click **"Process Files"**

### Step 4: Verify Results
1. Check the console for detailed logging:
   - File processing details
   - Extracted data from Claude API
   - LR number matching results
2. Look for the processing summary showing:
   - "Files processed: 1"
   - "Parcels updated: 1" 
   - "Unmatched files: 0"
3. Click on the parcel with ID `3001823710` to see extracted details

### Step 5: Download Comprehensive Report
1. Click **"Download Report"** button
2. Check the CSV file for all extracted information

## Expected Console Output

When processing works correctly, you should see:
```
Processing 1 files...
Processing file: 3001823710.pdf, type: application/pdf, size: XXXXX bytes
Claude API connection test: SUCCESS
Extracted data: { docketNumber: "3001823710", receiverName: "NDG Motors Private Limited", ... }
LR number from filename '3001823710.pdf': 3001823710
LR number from document: 3001823710
Matching parcel found: 3001823710
Updated parcel 3001823710 with POD data
Processing completed. Results: [...]
```

## Troubleshooting

### If API Status Shows "Failed":
1. Check `.env.local` file contains the correct Claude API key
2. Restart the development server
3. Click "Retry" button in the upload drawer

### If No Parcels Are Updated:
1. Ensure the filename contains the docket number (`3001823710`)
2. Check that a parcel with ID/LR Number `3001823710` exists
3. Review console logs for matching attempts

### If Extraction Seems Incomplete:
1. Check console logs for the full extracted data object
2. Verify the Claude API is being used (not mock data)
3. The document image quality may affect extraction accuracy

## File Naming Convention

For best results, name your PDF files with the docket number:
- ✅ `3001823710.pdf`
- ✅ `LR3001823710.pdf` 
- ✅ `AWB_3001823710.pdf`
- ✅ `DOCKET-3001823710.pdf`

The system will extract the LR number from both the filename and document content for matching.

## Real-time Status

The upload drawer now shows:
- API connection status
- File processing progress
- Match results for each file
- Processing summary with counts

This provides immediate feedback on whether the extraction and matching is working correctly.