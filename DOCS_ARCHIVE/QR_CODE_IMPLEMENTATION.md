# QR Code Viewing & Printable Batch PDF Implementation

## Problem Statement

Manufacturers needed a way to:

1. **View QR codes** for each code in a batch (not just code values)
2. **Print codes with QR codes** on stickers/labels for their products
3. **Download in printable format** (PDF) instead of just CSV data

## Solution Architecture

### Frontend Implementation

#### 1. **QR Code Modal**

- Added "📱 QR" button next to each code in the batch detail table
- Opens modal showing:
  - Large QR code image
  - Code value (selectable, copyable)
  - Code status (UNUSED/USED)
  - Copy button for quick code copying
  - Print hint for users

```javascript
// Users can:
- Click "📱 QR" button to view QR code
- Right-click to save/print QR code
- Copy code value from modal
```

#### 2. **Dual Download Options**

- **PDF Download** (Primary): Printable batch with all codes and QR placeholders
- **CSV Download** (Fallback): For data analysis and backup

#### 3. **Frontend Code Changes**

- Added `selectedCode` and `showQRModal` state
- Created QR modal component with image preview
- Updated code table with "View QR" button
- Changed download buttons to show both PDF and CSV options

### Backend Implementation

#### 1. **PDF Generation Service** (`pdfGenerator.js`)

```
File: backend/src/utils/pdfGenerator.js

Features:
- Generates A4-sized PDF (595 × 842 points)
- Layout: 3 columns × 4 rows = 12 codes per page
- Automatic pagination for large batches
- Header with batch info on first page:
  - Batch number
  - Product name
  - Expiration date
  - Total code count
```

#### 2. **Code Box Design**

Each code box includes:

```
┌─────────────────┐
│ CODE: ABC123... │
│                 │
│   (QR Code)     │  ← Space for actual QR code
│                 │    (can be printed as sticker)
│ Status: UNUSED  │
│ Print & Attach  │
└─────────────────┘
```

#### 3. **New Endpoint**

```
GET /manufacturer/batch/:id/download-pdf
- Requires authentication
- Fetches batch with all codes
- Generates printable PDF
- Returns PDF file for download
```

#### 4. **Backend Code Changes**

```javascript
// File: backend/src/controllers/manufacturerController.js
export async function downloadBatchPDF(req, res) {
  // Fetch batch with codes
  // Generate PDF using pdfGenerator utility
  // Return PDF buffer for download
}

// File: backend/src/utils/pdfGenerator.js
export async function generateBatchPDF(batch, codes) {
  // Create PDF document
  // Draw header with batch info
  // Draw code boxes in 3×4 grid
  // Handle multi-page batches
  // Return PDF buffer
}
```

## Workflow: How Manufacturers Use It

### Step 1: View Batch Details

```
Navigate → Batches → Click Batch ID → View all codes
```

### Step 2: View Individual QR Codes

```
Click "📱 QR" button → See QR code preview → Can copy code value
```

### Step 3: Download Printable PDF

```
Click "📄 PDF" button → Download batch_[id]_codes.pdf
```

### Step 4: Print and Apply

```
1. Open PDF in printer-friendly viewer
2. Print on standard A4 paper (12 codes per page)
3. Cut along lines to separate codes
4. Apply QR codes to product packaging
5. Consumers scan QR to verify product authenticity
```

## Technical Details

### Frontend Stack

- React hooks for state management
- Toast notifications for user feedback
- Modal for QR code display
- Blob API for file downloads

### Backend Stack

- pdf-lib library for PDF generation
- Prisma for database queries
- Express for API endpoints
- uuid for unique identifiers

### Database Schema

```
Batch
├── id (UUID)
├── batchNumber (string)
├── productId (FK)
├── manufacturerId (FK)
├── expirationDate (DateTime)
└── codes (Relation) → Code[]

Code
├── id (UUID)
├── codeValue (string, unique)
├── qrImagePath (string) - path to generated QR PNG
├── isUsed (boolean)
├── batchId (FK)
├── productId (FK)
└── manufacturerId (FK)
```

## File Storage

### QR Code Images

- **Location**: `/backend/uploads/qrcodes/`
- **Format**: PNG files
- **Filename**: `{codeValue}.png`
- **Size**: 300×300 pixels, high error correction
- **Generated when**: Code is created during batch creation

### PDF Output

- **Generated on-demand**: When user clicks download
- **Not stored**: Generated in memory and streamed to client
- **Format**: PDF with embedded placeholders for QR codes

## Print Format Specification

### A4 Paper Layout

```
Margin: 40pt on all sides
Grid: 3 columns × 4 rows = 12 codes per page
Code Box Dimensions: ~155pt × 160pt
Usable area: 595pt width, 842pt height

Page 1:
- Header (80pt): Batch info
- Grid: 12 code boxes

Pages 2+:
- Full grid: 12 code boxes per page
```

### Print Instructions for Manufacturers

```
1. Print PDF on standard A4 paper (Portrait)
2. Use 100% scale (no shrinking)
3. Recommended: Heavy-weight paper or sticker sheets
4. Cut along provided boxes
5. Apply QR code to product packaging
6. Consumers scan with smartphone camera

Quality Tips:
- Use high-quality printer (laser or inkjet)
- Ensure adequate contrast for QR scanning
- Test scan with smartphone before bulk printing
```

## API Contract

### Download PDF Endpoint

```
GET /manufacturer/batch/:id/download-pdf

Request Headers:
- Authorization: Bearer {token}
- Content-Type: application/json

Response Headers:
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="batch_[id]_codes.pdf"

Response Body:
- PDF file stream (binary)

Error Responses:
- 401: Unauthorized
- 404: Batch not found or no access
- 500: PDF generation failed
```

### Download CSV Endpoint (Still Available)

```
GET /manufacturer/batch/:id/download

Response Format:
Code,Status,Created Date,Product,Batch ID,Expiration Date
"ABC123...","UNUSED","2026-01-19","Product Name","batch_id","2026-12-31"
```

## Future Enhancements

1. **QR Code Customization**
   - Add manufacturer logo to QR codes
   - Custom colors for QR codes
   - Additional metadata in QR code

2. **Batch Printing**
   - Print multiple batches in one PDF
   - Batch label generation
   - Watermarking with batch info

3. **Template Selection**
   - Different print layouts (1, 2, 3 per row)
   - Sticker size options
   - Custom header designs

4. **Tracking**
   - Track which codes have been printed
   - Print statistics per manufacturer
   - Re-print history

## Testing Guide

### Test QR Code Modal

1. Navigate to batch detail page
2. Click "📱 QR" button on any code
3. Verify modal shows:
   - QR code image
   - Code value below
   - Status indicator
   - Copy button works

### Test PDF Download

1. Click "📄 PDF" button
2. File downloads as `batch_[id]_codes.pdf`
3. Open in PDF viewer
4. Verify:
   - Header shows batch information
   - All codes displayed in grid
   - Each code box has space for QR
   - Print preview shows proper layout

### Test CSV Download

1. Click "📊 CSV" button
2. File downloads as `batch_[id]_codes.csv`
3. Open in spreadsheet application
4. Verify all code data present

### Test Print Functionality

1. Generate test batch with 5 codes
2. Download PDF
3. Open in print preview
4. Print to PDF/physical printer
5. Verify output quality
6. Verify code boxes are properly sized for stickers

## Success Metrics

✅ **Manufacturers can view QR codes** for each code in batch
✅ **Downloadable PDF** with printable format (12 codes/page)
✅ **Cut-ready layout** for sticker application
✅ **CSV backup** still available for data export
✅ **No storage bloat** - PDFs generated on-demand
✅ **User-friendly** - intuitive buttons and clear workflow
