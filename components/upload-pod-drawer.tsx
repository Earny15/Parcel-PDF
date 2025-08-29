"use client"

import { useState, useCallback } from "react"
import * as React from "react"
import { X, Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useDropzone } from "react-dropzone"
import { OCRService } from "@/lib/ocr-service"

interface UploadPODDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPODComplete: (data: any[]) => void
  deliveredParcels: any[]
  onParcelUpdate: (updatedParcel: any) => void
}

export function UploadPODDrawer({ open, onOpenChange, onPODComplete, deliveredParcels, onParcelUpdate }: UploadPODDrawerProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any[]>([])
  const [apiStatus, setApiStatus] = useState<'unknown' | 'testing' | 'connected' | 'failed'>('unknown')
  
  // Test API connection when drawer opens
  React.useEffect(() => {
    if (open && apiStatus === 'unknown') {
      testAPIConnection()
    }
  }, [open, apiStatus])
  
  const testAPIConnection = async () => {
    setApiStatus('testing')
    try {
      const ocrService = new OCRService()
      const claudeService = (ocrService as any).claudeService
      const isConnected = await claudeService.testAPIConnection()
      setApiStatus(isConnected ? 'connected' : 'failed')
    } catch (error) {
      console.error('API test failed:', error)
      setApiStatus('failed')
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Files dropped/selected:', acceptedFiles)
    acceptedFiles.forEach(file => {
      console.log(`File: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`)
    })
    setUploadedFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp"],
    },
    multiple: true,
    onDropRejected: (rejectedFiles) => {
      console.log('Rejected files:', rejectedFiles)
      rejectedFiles.forEach(rejection => {
        console.log(`Rejected: ${rejection.file.name} - ${rejection.errors.map(e => e.message).join(', ')}`)
      })
    }
  })

  const extractLRNumberFromFileName = (fileName: string): string | null => {
    // Extract LR number from filename - enhanced patterns
    const patterns = [
      /LR[\s_-]?(\d+)/i,              // LR123456, LR_123456, LR-123456, LR 123456
      /AWB[\s_-]?(\d+)/i,             // AWB123456, AWB_123456
      /DOCKET[\s_-]?(\d+)/i,          // DOCKET123456
      /(\d{6,10})(?=\.|$)/,           // Pure numbers (6-10 digits) before extension or end
      /([A-Z]{2,}\d{6,})/i,          // Two or more letters followed by 6+ digits
      /^(\d+)[\s_-]/,                // Numbers at start followed by separator
      /(\d+)_/,                       // Numbers before underscore
    ]
    
    // Remove file extension first
    const nameWithoutExt = fileName.replace(/\.[^.]+$/, '')
    
    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    // Fallback: return the filename without extension if it's all digits
    if (/^\d{6,}$/.test(nameWithoutExt)) {
      return nameWithoutExt
    }
    
    return null
  }

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return

    setIsProcessing(true)
    try {
      const ocrService = new OCRService()
      const results = []
      const updatedParcels = []

      console.log(`Processing ${uploadedFiles.length} files...`)

      for (const file of uploadedFiles) {
        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)
        
        try {
          // Extract data from file using OCR
          console.log('Calling OCR service for file:', file.name)
          const extractedData = await ocrService.extractDataFromFile(file)
          console.log('✅ Real extracted data from OCR:', extractedData)
          console.log('Extracted data fields:', {
            docketNumber: extractedData.docketNumber,
            awbNumber: extractedData.awbNumber,
            receiverName: extractedData.receiverName,
            receiverAddress: extractedData.receiverAddress,
            signatureStatus: extractedData.signatureStatus,
            stampStatus: extractedData.stampStatus,
            actualWeight: extractedData.actualWeight,
            numberOfBoxes: extractedData.numberOfBoxes,
            invoiceNumber: extractedData.invoiceNumber,
            ewayBillNumber: extractedData.ewayBillNumber
          })
          
          // Extract LR number from filename
          const lrFromFilename = extractLRNumberFromFileName(file.name)
          console.log(`LR number from filename '${file.name}':`, lrFromFilename)
          
          // Also try to extract LR from the document content
          const lrFromDocument = extractedData.docketNumber || extractedData.awbNumber
          console.log('LR number from document:', lrFromDocument)
          
          // Find matching parcel by LR number with enhanced matching
          const matchingParcel = deliveredParcels.find(parcel => {
            const candidates = [lrFromFilename, lrFromDocument].filter(Boolean)
            
            for (const candidate of candidates) {
              if (
                parcel.lrNumber === candidate || 
                parcel.id === candidate ||
                parcel.orderId === candidate ||
                // Also check if parcel ID/LR contains the extracted number
                parcel.lrNumber?.includes(candidate) ||
                parcel.id?.includes(candidate) ||
                // Check reverse - if candidate contains parcel identifiers
                (parcel.lrNumber && candidate.includes(parcel.lrNumber)) ||
                (parcel.id && candidate.includes(parcel.id))
              ) {
                return true
              }
            }
            return false
          })

          console.log('Matching parcel found:', matchingParcel ? matchingParcel.id : 'None')

          if (matchingParcel) {
            // Update existing parcel with extracted data
            const updatedParcel = {
              ...matchingParcel,
              // Map AWB Number from docket number or awbNumber field
              awbNumber: extractedData.awbNumber || extractedData.docketNumber,
              signatureStatus: extractedData.signatureStatus || (extractedData.signaturePresent ? "Signature Present" : "Signature Not Present"),
              stampStatus: extractedData.stampStatus || "Available",
              recipientName: extractedData.receiverName || extractedData.consigneeName,
              recipientAddress: extractedData.receiverAddress,
              actualWeight: extractedData.actualWeight,
              numberOfBoxes: extractedData.numberOfBoxes,
              invoiceNumber: extractedData.invoiceNumber,
              ewayBillNumber: extractedData.ewayBillNumber,
              damageComments: extractedData.damageComments || '',
              // Additional tracking fields
              podProcessed: true,
              podFileName: file.name,
              podProcessedAt: new Date().toISOString(),
              // Keep original data for reference
              originalData: {
                consignorName: extractedData.consignorName,
                consigneeName: extractedData.consigneeName || extractedData.receiverName,
                docketNumber: extractedData.docketNumber
              }
            }
            
            console.log('About to update parcel with data:', {
              id: updatedParcel.id,
              awbNumber: updatedParcel.awbNumber,
              signatureStatus: updatedParcel.signatureStatus,
              stampStatus: updatedParcel.stampStatus,
              recipientName: updatedParcel.recipientName,
              recipientAddress: updatedParcel.recipientAddress,
              actualWeight: updatedParcel.actualWeight,
              numberOfBoxes: updatedParcel.numberOfBoxes,
              podProcessed: updatedParcel.podProcessed
            })
            
            updatedParcels.push(updatedParcel)
            onParcelUpdate(updatedParcel)
            console.log(`✅ Updated parcel ${updatedParcel.id} with POD data`)
            console.log('Final updated parcel object:', updatedParcel)
          } else {
            console.warn(`⚠️ No matching parcel found for file: ${file.name} (LR candidates: ${[lrFromFilename, lrFromDocument].filter(Boolean).join(', ')})`)
          }

          results.push({
            ...extractedData,
            fileName: file.name,
            lrFromFilename: lrFromFilename,
            lrFromDocument: lrFromDocument,
            matchedParcel: !!matchingParcel,
            matchedParcelId: matchingParcel?.id || null
          })
        } catch (fileError) {
          console.error(`❌ Error processing file ${file.name}:`, fileError)
          
          // Show user-friendly error message based on error type
          let userMessage = `❌ Failed to process ${file.name}:\n\n`
          
          if (fileError.message.includes('Only 4 characters extracted') || 
              fileError.message.includes('Insufficient text extracted')) {
            userMessage += `📄 This PDF appears to be image-based (scanned document) with no selectable text.
            
💡 Solutions:
• Use a PDF with selectable/copyable text
• Convert your scanned PDF using OCR software
• Try uploading the document as a high-quality image instead

🔍 Test: Try selecting text in your PDF with your cursor - if you can't select text, it's image-based.`
          } else if (fileError.message.includes('Cannot process image files') ||
                     fileError.message.includes('Vision models are not available')) {
            userMessage += `📷 Image files require Claude Vision models, which are not available with your current API key.

💡 Solutions:
• Convert your image to a text-based PDF
• Use OCR software to extract text from the image first
• Upload a PDF with selectable text instead
• Upgrade your Claude API key to access vision models

📝 Note: The system can only process PDFs with extractable text, not image files.`
          } else if (fileError.message.includes('PDF.js')) {
            userMessage += `⚙️ PDF processing error: ${fileError.message}
            
💡 Try:
• Using a different PDF file
• Checking if the PDF is corrupted
• Converting the PDF to a standard format`
          } else {
            userMessage += fileError.message
          }
          
          alert(userMessage)
          
          // Add failed result to track the error
          results.push({
            fileName: file.name,
            error: fileError.message,
            extractionFailed: true,
            matchedParcel: false,
            matchedParcelId: null
          })
        }
      }

      console.log('Processing completed. Results:', results)
      setExtractedData(results)
      onPODComplete(results)
    } catch (error) {
      console.error("POD processing failed:", error)
      alert(`POD processing failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = () => {
    if (extractedData.length > 0) {
      onOpenChange(false)
      setUploadedFiles([])
      setExtractedData([])
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[500px]">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-xl font-semibold">Upload POD</SheetTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* API Status Indicator */}
          <div className={`p-3 rounded-lg border ${
            apiStatus === 'connected' ? 'bg-green-50 border-green-200' :
            apiStatus === 'failed' ? 'bg-red-50 border-red-200' :
            apiStatus === 'testing' ? 'bg-yellow-50 border-yellow-200' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-green-500' :
                apiStatus === 'failed' ? 'bg-red-500' :
                apiStatus === 'testing' ? 'bg-yellow-500 animate-pulse' :
                'bg-gray-400'
              }`} />
              <span className={`font-medium ${
                apiStatus === 'connected' ? 'text-green-800' :
                apiStatus === 'failed' ? 'text-yellow-800' :
                apiStatus === 'testing' ? 'text-yellow-800' :
                'text-gray-600'
              }`}>
                {apiStatus === 'connected' && 'Claude API Connected - Real PDF text extraction enabled'}
                {apiStatus === 'failed' && 'Claude API Limited - Using enhanced RIVIGO mock data'}
                {apiStatus === 'testing' && 'Testing Claude API connection...'}
                {apiStatus === 'unknown' && 'Checking API status...'}
              </span>
              {apiStatus === 'failed' && (
                <button
                  onClick={testAPIConnection}
                  className="text-xs text-blue-600 hover:text-blue-800 underline ml-auto"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
          
          {/* File Upload Area */}
          <div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Drop your POD files here.</p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <Button variant="outline" className="bg-blue-900 text-white hover:bg-blue-800">
                <Upload className="h-4 w-4 mr-2" />
                BROWSE FILES
              </Button>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Uploaded Files:</h4>
                <ul className="space-y-1">
                  {uploadedFiles.map((file, index) => {
                    const result = extractedData.find(r => r.fileName === file.name)
                    return (
                      <li key={index} className="text-sm flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>{file.name}</span>
                        </div>
                        {result && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            result.matchedParcel 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {result.matchedParcel ? `✓ Matched ${result.matchedParcelId}` : '⚠ No match'}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
                <Button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? "Processing POD..." : "Process Files"}
                </Button>
                
                {extractedData.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Processing Summary</h5>
                    <div className="text-sm text-blue-700">
                      <div>Files processed: {extractedData.length}</div>
                      <div className="text-green-700">✅ Successful extractions: {extractedData.filter(r => !r.extractionFailed).length}</div>
                      <div className="text-red-700">❌ Failed extractions: {extractedData.filter(r => r.extractionFailed).length}</div>
                      <div>Parcels updated: {extractedData.filter(r => r.matchedParcel && !r.extractionFailed).length}</div>
                      <div>Unmatched files: {extractedData.filter(r => !r.matchedParcel && !r.extractionFailed).length}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={extractedData.length === 0}
            className="w-full bg-blue-900 hover:bg-blue-800"
          >
            SUBMIT
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}