# Parcel OCR System

A Next.js application for courier companies to upload Electronic Proof of Delivery (EPOD) documents and extract parcel data using OCR technology with Claude AI.

## Features

- 📄 **PDF & Image Upload**: Drag-and-drop interface for EPOD documents
- 🤖 **AI-Powered OCR**: Real PDF text extraction using PDF.js + Claude AI analysis
- 🔍 **Smart Parcel Matching**: Automatic LR number extraction and parcel matching
- 📊 **Data Management**: View and track parcels across different states (draft, pending, transit, delivered, cancelled)
- 📈 **Export Functionality**: Download extracted data as CSV reports
- 🎯 **Field Extraction**: Extract AWB numbers, receiver details, signature status, stamp status, and more

## Technology Stack

- **Frontend**: Next.js 15 with React 19, TypeScript
- **UI Components**: Radix UI primitives with Tailwind CSS
- **PDF Processing**: PDF.js for text extraction
- **AI Analysis**: Claude 3 Haiku for intelligent data extraction
- **File Handling**: react-dropzone for file uploads
- **State Management**: React hooks for local component state

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Claude API key (required for real PDF extraction - system works with enhanced mock data without it)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd parcel-ocr-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup (optional)**
   ```bash
   cp .env.example .env.local
   # Add your Claude API key to .env.local for real OCR processing
   NEXT_PUBLIC_CLAUDE_API_KEY=your_claude_api_key_here
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Usage

### 1. Upload Parcels
- Use "Upload Parcels" button to import parcel data via CSV template
- Download the template, fill with LR numbers and dates
- Upload completed template to create parcels

### 2. Upload POD Documents
- Click "Upload POD" button
- Drag & drop PDF/image files containing delivery documents
- Name files with LR numbers (e.g., `3001823710.pdf`) for automatic matching
- System extracts data and matches to existing parcels

### 3. View Extracted Data
- Click on any parcel to view detailed POD information
- See extracted fields: AWB numbers, signatures, stamps, receiver details
- Review processing status and original document data

### 4. Generate Reports
- Use "Download Report" button for comprehensive CSV export
- Includes all parcel data plus extracted POD information
- Perfect for audit trails and data analysis

## Architecture

### Data Flow
```
PDF Upload → PDF.js Text Extraction → Claude AI Analysis → Data Normalization → Parcel Matching → UI Update
```

### Key Components
- `app/page.tsx` - Main dashboard with parcel management interface
- `components/upload-pod-drawer.tsx` - POD file upload with processing
- `components/pod-details.tsx` - Detailed parcel information view
- `lib/claude-pdf-service.ts` - PDF processing and AI analysis
- `lib/pdf-text-extractor.ts` - PDF.js text extraction
- `app/api/claude/` - Server-side Claude AI integration

### OCR Processing
1. **PDF Text Extraction**: PDF.js extracts raw text from uploaded documents
2. **AI Analysis**: Claude 3 Haiku analyzes extracted text for structured data
3. **Field Mapping**: System maps extracted fields to parcel properties
4. **Smart Matching**: LR numbers from filenames and document content match parcels

## Configuration

### Environment Variables
- `NEXT_PUBLIC_CLAUDE_API_KEY` - Claude API key for real OCR processing

### API Endpoints
- `GET /api/claude/test` - Test Claude API connection
- `POST /api/claude/analyze-text` - Analyze extracted PDF text
- `GET /api/claude/models` - Check available Claude models

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint (setup required)

## Data Extraction Fields

The system extracts the following fields from POD documents:

### Basic Information
- **Docket/AWB Number**: Unique tracking identifier
- **Invoice Number**: Associated invoice reference
- **E-way Bill Number**: Electronic waybill reference

### Shipping Details
- **Receiver Name**: Consignee name
- **Receiver Address**: Complete delivery address
- **Consignor Name**: Shipper name
- **Consignor Address**: Sender address

### Package Information
- **Number of Boxes**: Package count
- **Actual Weight**: Total weight with unit
- **Delivery Date**: Delivery completion date

### Verification Status
- **Signature Status**: Present/Not Present/Not Clear
- **Stamp Status**: Available/Not Available/Not Clear
- **Damage Comments**: Any delivery condition notes

## File Naming Convention

For optimal parcel matching, name POD files with LR/docket numbers:
- ✅ `3001823710.pdf`
- ✅ `LR3001823710.pdf`
- ✅ `AWB_3001823710.pdf`
- ✅ `DOCKET-3001823710.pdf`

## Troubleshooting

### Common Issues

**No Parcels Updated**
- Ensure filename contains LR number matching existing parcel
- Check console logs for matching attempts
- Verify parcel exists in system

**Mock Data Instead of Real OCR**
- Add Claude API key to `.env.local`
- Restart development server
- Check API status indicator in upload drawer

**PDF Processing Errors**
- Ensure file is valid PDF format
- Check console for PDF.js extraction errors
- Verify file size is reasonable

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting guides in the `/docs` folder
- Review console logs for debugging information
- Open an issue on GitHub with detailed error information