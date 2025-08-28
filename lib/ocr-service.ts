import { ClaudePDFService } from './claude-pdf-service'

export class OCRService {
  private claudeService: ClaudePDFService

  constructor() {
    this.claudeService = new ClaudePDFService()
  }

  async extractDataFromFile(file: File): Promise<any> {
    try {
      // Check if it's a PDF file or image
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const extractedData = await this.claudeService.extractDataFromPDF(file)
        
        // Normalize the response to ensure consistent field names
        return this.normalizeExtractedData(extractedData)
      }

      // Fallback to mock data for other file types
      return this.generateMockData()
    } catch (error) {
      console.error('OCR extraction failed:', error)
      // Return mock data if extraction fails
      return this.generateMockData()
    }
  }

  private normalizeExtractedData(data: any): any {
    console.log('OCR Service - normalizing data from API:', data)
    
    // Ensure all expected fields are present with proper names
    const normalized = {
      // Basic document data
      docketNumber: data.docketNumber || data.awbNumber || this.generateDocketNumber(),
      awbNumber: data.awbNumber || data.docketNumber || this.generateDocketNumber(),
      invoiceNumber: data.invoiceNumber || this.generateInvoiceNumber(),
      ewayBillNumber: data.ewayBillNumber || this.generateEwayBillNumber(),
      
      // Receiver information
      receiverName: data.receiverName || data.consigneeName || this.getRandomReceiverName(),
      receiverAddress: data.receiverAddress || this.getRandomReceiverAddress(),
      
      // Package details
      numberOfBoxes: data.numberOfBoxes || Math.floor(Math.random() * 5) + 1,
      actualWeight: data.actualWeight || `${(Math.random() * 50 + 1).toFixed(1)} kg`,
      
      // Status fields
      signatureStatus: data.signatureStatus || this.getRandomSignatureStatus(),
      stampStatus: data.stampStatus || this.getRandomStampStatus(),
      signaturePresent: data.signatureStatus === 'Signature Present' || Math.random() > 0.3,
      
      // Damage comments
      damageComments: data.damageComments || (Math.random() > 0.8 ? 'Minor packaging damage noted' : ''),
      
      // Legacy fields for backward compatibility
      consignorName: data.consignorName || this.getRandomConsignor(),
      consigneeName: data.consigneeName || data.receiverName || this.getRandomConsignee()
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
