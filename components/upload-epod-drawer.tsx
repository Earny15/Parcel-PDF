"use client"

import { useState, useCallback } from "react"
import { X, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { useDropzone } from "react-dropzone"
import { OCRService } from "@/lib/ocr-service"

interface UploadEPODDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOCRComplete: (data: any[]) => void
  onDataExtracted: (data: any[]) => void
}

export function UploadEPODDrawer({ open, onOpenChange, onOCRComplete, onDataExtracted }: UploadEPODDrawerProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processedData, setProcessedData] = useState<any[]>([])
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "completed" | "error">("idle")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles)
    setProcessingStatus("idle")
    setProcessedData([])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: true,
  })

  const handleProcessFiles = async () => {
    if (uploadedFiles.length === 0) return

    setIsProcessing(true)
    setProcessingStatus("processing")
    setProcessingProgress(0)

    try {
      const ocrService = new OCRService()
      const results = []

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        setProcessingProgress(((i + 1) / uploadedFiles.length) * 100)

        const extractedData = await ocrService.extractDataFromFile(file)
        results.push({
          ...extractedData,
          fileName: file.name,
          fileSize: file.size,
          processedAt: new Date().toISOString(),
        })
      }

      setProcessedData(results)
      setProcessingStatus("completed")
      onOCRComplete(results)
      onDataExtracted(results)
    } catch (error) {
      console.error("OCR processing failed:", error)
      setProcessingStatus("error")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setUploadedFiles([])
    setProcessedData([])
    setProcessingStatus("idle")
    setProcessingProgress(0)
    onOpenChange(false)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((files) => files.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.multiple = true
    fileInput.accept = ".pdf,.png,.jpg,.jpeg"
    fileInput.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      if (files.length > 0) {
        setUploadedFiles(files)
        setProcessingStatus("idle")
        setProcessedData([])
      }
    }
    fileInput.click()
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-[500px] sm:w-[500px]">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-xl font-semibold text-green-700">Upload EPOD Files</SheetTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* Instructions */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">Instructions</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>1. Click the "Upload EPOD Files" button below</p>
              <p>2. Select multiple EPOD documents (PDF, PNG, JPG)</p>
              <p>3. Our OCR system will automatically extract:</p>
              <ul className="ml-6 mt-2 space-y-1">
                <li>• Docket Number</li>
                <li>• Consignor & Consignee Names</li>
                <li>• Invoice & EwayBill Numbers</li>
                <li>• Number of Boxes</li>
                <li>• Signature Detection</li>
              </ul>
            </div>
          </div>

          {/* Upload Button */}
          {uploadedFiles.length === 0 && (
            <div className="text-center">
              <Button
                onClick={triggerFileInput}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                size="lg"
              >
                <Upload className="h-6 w-6 mr-3" />
                Upload EPOD Files
              </Button>
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Selected Files ({uploadedFiles.length})</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  className="text-green-600 border-green-600 bg-transparent"
                >
                  Add More Files
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Process Button */}
              <Button
                onClick={handleProcessFiles}
                disabled={isProcessing || processingStatus === "completed"}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                {isProcessing
                  ? "Processing OCR..."
                  : processingStatus === "completed"
                    ? "Processing Complete ✓"
                    : "Start OCR Processing"}
              </Button>
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Processing files...</span>
                <span>{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="w-full h-2" />
            </div>
          )}

          {/* Processing Results */}
          {processingStatus === "completed" && processedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-6 w-6" />
                <h4 className="font-medium text-lg">OCR Processing Complete!</h4>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium mb-2">
                  Successfully processed {processedData.length} EPOD file(s)
                </p>
                <p className="text-sm text-green-700">Data has been extracted and added to your Delivered tab.</p>
              </div>

              <Button onClick={handleClose} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                Done
              </Button>
            </div>
          )}

          {/* Error State */}
          {processingStatus === "error" && (
            <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h4 className="font-medium">Processing Failed</h4>
                <p className="text-sm">Please try again or contact support.</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
