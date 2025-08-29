import { ClaudePDFService } from './claude-pdf-service'

export class OCRService {
  private claudeService: ClaudePDFService

  constructor() {
    this.claudeService = new ClaudePDFService()
  }

  async extractDataFromFile(file: File): Promise<any> {
    try {
      console.log('OCR Service - Starting extraction for file:', file.name, 'Type:', file.type)
      
      // Check if it's a PDF file or image
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        console.log('OCR Service - File type supported, calling Claude service...')
        
        const extractedData = await this.claudeService.extractDataFromPDF(file)
        console.log('OCR Service - Raw data received from Claude service:', extractedData)
        
        // Check if we got real data or mock data
        if (extractedData && typeof extractedData === 'object') {
          console.log('OCR Service - Data received, normalizing...')
          const normalizedData = this.normalizeExtractedData(extractedData)
          console.log('OCR Service - Final normalized data:', normalizedData)
          return normalizedData
        } else {
          console.error('OCR Service - No valid data received from Claude service')
          throw new Error('No valid data received from extraction service')
        }
      }

      // No support for other file types - throw error
      console.error('OCR Service - Unsupported file type:', file.type)
      throw new Error(`Unsupported file type: ${file.type}. Only PDF files and images are supported.`)
    } catch (error) {
      console.error('OCR extraction failed with error:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        fileName: file.name,
        fileType: file.type
      })
      // Only return mock data for actual failures, not for debugging
      throw error // Re-throw the error instead of silently falling back
    }
  }

  private normalizeExtractedData(data: any): any {
    console.log('OCR Service - normalizing data from API:', data)
    
    // NO DUMMY DATA - Only use actual extracted data
    const normalized = {
      // Basic document data - only use real extracted values
      docketNumber: data.docketNumber || data.awbNumber || null,
      awbNumber: data.awbNumber || data.docketNumber || null,
      invoiceNumber: data.invoiceNumber || null,
      ewayBillNumber: data.ewayBillNumber || null,
      
      // Receiver information - only real data
      receiverName: data.receiverName || data.consigneeName || null,
      receiverAddress: data.receiverAddress || null,
      
      // Package details - only real data
      numberOfBoxes: data.numberOfBoxes || null,
      actualWeight: data.actualWeight || null,
      
      // Status fields - only real data
      signatureStatus: data.signatureStatus || null,
      stampStatus: data.stampStatus || null,
      signaturePresent: data.signatureStatus === 'Signature Present',
      
      // Damage comments - only real data
      damageComments: data.damageComments || null,
      
      // Legacy fields for backward compatibility - only real data
      consignorName: data.consignorName || null,
      consigneeName: data.consigneeName || data.receiverName || null
    }
    
    // Check if we have ANY real data, if not throw error
    const hasRealData = Object.values(normalized).some(value => 
      value !== null && value !== undefined && value !== ''
    )
    
    if (!hasRealData) {
      throw new Error('No meaningful data extracted from document. All fields are empty/null.')
    }
    
    console.log('OCR Service - normalized data output:', normalized)
    return normalized
  }

  private generateMockData(): any {
    return {
      docketNumber: this.generateDocketNumber(),
      awbNumber: this.generateDocketNumber(),
      consignorName: this.getRandomConsignor(),
      consigneeName: this.getRandomConsignee(),
      invoiceNumber: this.generateInvoiceNumber(),
      ewayBillNumber: this.generateEwayBillNumber(),
      numberOfBoxes: Math.floor(Math.random() * 5) + 1,
      signaturePresent: Math.random() > 0.3,
      signatureStatus: this.getRandomSignatureStatus(),
      stampStatus: this.getRandomStampStatus(),
      receiverName: this.getRandomReceiverName(),
      receiverAddress: this.getRandomReceiverAddress(),
      actualWeight: `${(Math.random() * 50 + 1).toFixed(1)} kg`,
      damageComments: Math.random() > 0.8 ? 'Minor packaging damage noted' : ''
    }
  }

  // Method to set custom extraction prompt
  setExtractionPrompt(prompt: string): void {
    this.claudeService.setExtractionPrompt(prompt)
  }

  private generateDocketNumber(): string {
    return Math.floor(Math.random() * 100000000).toString()
  }

  private generateInvoiceNumber(): string {
    return `INV-${Math.floor(Math.random() * 10000)}`
  }

  private generateEwayBillNumber(): string {
    return `EWB${Math.floor(Math.random() * 1000000000000)}`
  }

  private getRandomConsignor(): string {
    const consignors = [
      "ABC Pvt Ltd",
      "ABXYZ Corporation",
      "Amit Enterprises",
      "Global Logistics Ltd",
      "Express Courier Services",
    ]
    return consignors[Math.floor(Math.random() * consignors.length)]
  }

  private getRandomConsignee(): string {
    const consignees = ["ABXYZ", "ABC Pvt Ltd", "Ather Energy Pvt Ltd", "Tech Solutions Inc", "Modern Enterprises"]
    return consignees[Math.floor(Math.random() * consignees.length)]
  }

  private getRandomSignatureStatus(): string {
    const statuses = ["Signature Present", "Signature Not Present", "Signature Not Clear"]
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  private getRandomStampStatus(): string {
    const statuses = ["Available", "Not Available", "Not Clear"]
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  private getRandomReceiverName(): string {
    const names = ["John Smith", "Priya Sharma", "Rajesh Kumar", "Anita Singh", "Michael Johnson", "Sunita Patel"]
    return names[Math.floor(Math.random() * names.length)]
  }

  private getRandomReceiverAddress(): string {
    const addresses = [
      "123 MG Road, Bangalore - 560001",
      "45 Park Street, Kolkata - 700016",
      "78 Marine Drive, Mumbai - 400020",
      "21 CP, New Delhi - 110001",
      "67 Anna Salai, Chennai - 600002"
    ]
    return addresses[Math.floor(Math.random() * addresses.length)]
  }

  // Real OCR implementation would look something like this:
  /*
  async extractDataFromFile(file: File): Promise<any> {
    try {
      // Convert file to base64 or form data
      const formData = new FormData()
      formData.append('file', file)
      
      // Call OCR API (example with Google Cloud Vision)
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      })
      
      const ocrResult = await response.json()
      
      // Parse OCR text to extract specific fields
      return this.parseOCRText(ocrResult.text)
    } catch (error) {
      console.error('OCR processing failed:', error)
      throw error
    }
  }

  private parseOCRText(text: string): any {
    // Use regex patterns to extract specific data fields
    const docketMatch = text.match(/(?:docket|tracking)[\s\w]*?(\d{6,})/i)
    const invoiceMatch = text.match(/(?:invoice|inv)[\s\w]*?([A-Z0-9-]+)/i)
    // ... more parsing logic
    
    return {
      docketNumber: docketMatch?.[1] || '',
      consignorName: this.extractConsignorName(text),
      consigneeName: this.extractConsigneeName(text),
      invoiceNumber: invoiceMatch?.[1] || '',
      ewayBillNumber: this.extractEwayBill(text),
      numberOfBoxes: this.extractBoxCount(text),
      signaturePresent: this.detectSignature(text)
    }
  }
  */
}
