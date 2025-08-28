"\"use client"

import { useState, useCallback } from "react"
import { X, Upload, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useDropzone } from "react-dropzone"
import { OCRService } from "@/lib/ocr-service"
import { ExcelService } from "@/lib/excel-service"

interface ImportDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOCRComplete: (data: any[]) => void
  onDataExtracted?: (data: any[]) => void
}

export function UploadEPODDrawer({ open, onOpenChange, onOCRComplete, onDataExtracted }: ImportDrawerProps) {
  const [importType, setImportType] = useState("create-parcel")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
  })

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return

    setIsProcessing(true)
    try {
      const excelService = new ExcelService()
      const results = await excelService.parseUploadedTemplate(uploadedFiles[0])
      
      setExtractedData(results)
      onOCRComplete(results)
      if (onDataExtracted) {
        onDataExtracted(results)
      }
    } catch (error) {
      console.error("Template processing failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadTemplate = () => {
    const excelService = new ExcelService()
    excelService.downloadParcelTemplate()
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
          <SheetTitle className="text-xl font-semibold">Import</SheetTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="mt-6 space-y-6">

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
              disabled={uploadedFiles.length === 0 || isProcessing}
              onClick={handleUpload}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Upload Template"}
            </Button>
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
              <p className="text-lg font-medium mb-2">Drop your Excel template here.</p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <Button variant="outline" className="bg-blue-900 text-white hover:bg-blue-800">
                <Upload className="h-4 w-4 mr-2" />
                UPLOAD
              </Button>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Uploaded Files:</h4>
                <ul className="space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      {file.name}
                    </li>
                  ))}
                </ul>
                {!isProcessing && (
                  <div className="mt-3 text-sm text-gray-500">
                    File ready for processing. Click 'Upload Template' button above.
                  </div>
                )}
                {isProcessing && (
                  <div className="mt-3 text-sm text-blue-600">
                    Processing template...
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
