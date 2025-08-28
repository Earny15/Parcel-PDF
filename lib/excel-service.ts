export class ExcelService {
  downloadTemplate(): void {
    const headers = [
      "Docket Number",
      "Consignor Name",
      "Consignee Name",
      "Invoice Number",
      "EwayBill Number",
      "Number of Boxes",
      "Signature Present",
    ]

    const csvContent = headers.join(",") + "\n"
    this.downloadCSV(csvContent, "EPOD_Blank_Template.csv")
  }

  downloadParcelTemplate(): void {
    const headers = [
      "S.No",
      "LR Number",
      "LR Date"
    ]

    const csvContent = headers.join(",") + "\n"
    this.downloadCSV(csvContent, "Parcel_Template.csv")
  }

  async parseUploadedTemplate(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n').filter(line => line.trim())
          
          if (lines.length < 2) {
            reject(new Error('Template file is empty or invalid'))
            return
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          const parcels = []

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
            
            if (values.length >= 3 && values[1]) {
              parcels.push({
                id: values[1], // LR Number as tracking ID
                orderId: "N/A",
                carrier: "Template Import",
                tags: [],
                source: "",
                sourceLocation: "",
                destination: "",
                destinationLocation: "",
                transitTime: "N/A",
                status: "DELIVERED",
                lrNumber: values[1],
                lrDate: values[2],
                serialNumber: values[0]
              })
            }
          }

          resolve(parcels)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }

  downloadExtractedData(data: any[]): void {
    const headers = [
      "Docket Number",
      "Consignor Name",
      "Consignee Name",
      "Invoice Number",
      "EwayBill Number",
      "Number of Boxes",
      "Signature Present",
      "File Name",
      "Processed Date",
    ]

    let csvContent = headers.join(",") + "\n"

    data.forEach((item) => {
      const row = [
        item.docketNumber || "",
        item.consignorName || "",
        item.consigneeName || "",
        item.invoiceNumber || "",
        item.ewayBillNumber || "",
        item.numberOfBoxes || "",
        item.signaturePresent ? "Yes" : "No",
        item.fileName || "",
        item.processedAt ? new Date(item.processedAt).toLocaleDateString() : "",
      ]
      csvContent += row.map((field) => `"${field}"`).join(",") + "\n"
    })

    const timestamp = new Date().toISOString().split("T")[0]
    this.downloadCSV(csvContent, `EPOD_Extracted_Data_${timestamp}.csv`)
  }

  downloadComprehensiveReport(parcels: any[]): void {
    const headers = [
      // Basic Parcel Information
      "LR Number",
      "Tracking ID",
      "Order ID",
      "LR Date",
      "Carrier",
      "Source",
      "Source Location",
      "Destination",
      "Destination Location",
      "Transit Time",
      "Status",
      
      // Extracted OCR Information
      "AWB Number",
      "Signature Status",
      "Stamp Status",
      "Recipient Name",
      "Recipient Address",
      "Actual Weight",
      "Number of Boxes",
      "Invoice Number",
      "E-way Bill Number",
      "Damage Comments",
      
      // POD Processing Details
      "POD Processed",
      "POD File Name",
      "POD Processed At",
      
      // Original OCR Data
      "Original Consignor",
      "Original Consignee",
      "Original Docket Number"
    ]

    let csvContent = headers.join(",") + "\n"

    console.log(`Generating comprehensive report for ${parcels.length} parcels`)

    parcels.forEach((parcel, index) => {
      console.log(`Processing parcel ${index + 1}:`, {
        id: parcel.id,
        lrNumber: parcel.lrNumber,
        podProcessed: parcel.podProcessed,
        awbNumber: parcel.awbNumber,
        signatureStatus: parcel.signatureStatus
      })
      
      const row = [
        // Basic Parcel Information
        this.sanitizeField(parcel.lrNumber || ""),
        this.sanitizeField(parcel.id || ""),
        this.sanitizeField(parcel.orderId || ""),
        this.sanitizeField(parcel.lrDate || ""),
        this.sanitizeField(parcel.carrier || ""),
        this.sanitizeField(parcel.source || ""),
        this.sanitizeField(parcel.sourceLocation || ""),
        this.sanitizeField(parcel.destination || ""),
        this.sanitizeField(parcel.destinationLocation || ""),
        this.sanitizeField(parcel.transitTime || ""),
        this.sanitizeField(parcel.status || ""),
        
        // Extracted OCR Information
        this.sanitizeField(parcel.awbNumber || ""),
        this.sanitizeField(parcel.signatureStatus || ""),
        this.sanitizeField(parcel.stampStatus || ""),
        this.sanitizeField(parcel.recipientName || ""),
        this.sanitizeField(parcel.recipientAddress || ""),
        this.sanitizeField(parcel.actualWeight || ""),
        this.sanitizeField(parcel.numberOfBoxes || ""),
        this.sanitizeField(parcel.invoiceNumber || ""),
        this.sanitizeField(parcel.ewayBillNumber || ""),
        this.sanitizeField(parcel.damageComments || ""),
        
        // POD Processing Details
        parcel.podProcessed ? "Yes" : "No",
        this.sanitizeField(parcel.podFileName || ""),
        parcel.podProcessedAt ? new Date(parcel.podProcessedAt).toLocaleString() : "",
        
        // Original OCR Data
        this.sanitizeField(parcel.originalData?.consignorName || ""),
        this.sanitizeField(parcel.originalData?.consigneeName || ""),
        this.sanitizeField(parcel.originalData?.docketNumber || "")
      ]
      csvContent += row.map((field) => `"${field}"`).join(",") + "\n"
    })

    const timestamp = new Date().toISOString().split("T")[0]
    const fileName = `Comprehensive_Parcel_Report_${timestamp}.csv`
    console.log(`Downloading report as: ${fileName}`)
    this.downloadCSV(csvContent, fileName)
  }

  private sanitizeField(value: any): string {
    if (value === null || value === undefined) return ""
    return String(value).replace(/"/g, '""') // Escape quotes for CSV
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // For a more robust Excel implementation, you could use libraries like:
  // - xlsx or exceljs for creating proper Excel files
  // - SheetJS for advanced Excel manipulation
  /*
  import * as XLSX from 'xlsx'
  
  downloadExcelTemplate(): void {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Docket Number', 'Consignor Name', 'Consignee Name', 'Invoice Number', 'EwayBill Number', 'Number of Boxes', 'Signature Present']
    ])
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'EPOD Template')
    
    XLSX.writeFile(workbook, 'EPOD_Template.xlsx')
  }
  */
}
