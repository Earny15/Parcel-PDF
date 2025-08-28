# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server on http://localhost:3000
- `pnpm build` - Build the application for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint to check for code issues

## Project Architecture

This is a Next.js 15 application for a parcel OCR system that allows courier companies to:

1. **Upload EPOD (Electronic Proof of Delivery) documents** - PDFs and images through drag-and-drop interface
2. **Extract data using OCR** - Mock OCR service that simulates data extraction from delivery documents
3. **Manage parcel deliveries** - View and track parcels across different states (draft, pending, transit, delivered, cancelled)
4. **Export data** - Download extracted data as CSV templates

### Key Components Structure

- `app/page.tsx` - Main dashboard with parcel management interface, tabs for different parcel states
- `components/import-drawer.tsx` (UploadEPODDrawer) - File upload component with drag-and-drop for EPOD documents
- `components/download-template-drawer.tsx` - CSV template download functionality
- `components/delivered-table.tsx` - Table component for displaying delivered parcels
- `components/pod-details.tsx` - Detailed view for individual parcel information

### Core Services

- `lib/ocr-service.ts` - Mock OCR service that simulates extracting parcel data from uploaded documents
- `lib/excel-service.ts` - CSV generation and download functionality for templates and extracted data

### Data Flow

1. User uploads EPOD files through import drawer
2. OCR service processes files (currently mocked) to extract fields like docket number, consignor/consignee names, invoice numbers
3. Extracted data gets added to the parcels list in the delivered state
4. Users can download CSV templates or export extracted data

### Technology Stack

- **Frontend**: Next.js 15 with React 19, TypeScript
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with custom blue theme
- **File Handling**: react-dropzone for file uploads
- **State Management**: React hooks (useState) for local component state

### Build Configuration

- TypeScript and ESLint errors are ignored during builds (`ignoreBuildErrors: true`, `ignoreDuringBuilds: true`)
- Images are unoptimized for static export compatibility
- Uses absolute imports with `@/*` path mapping