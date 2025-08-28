"use client"

import { useState } from "react"
import { X, Download, FileText, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { ExcelService } from "@/lib/excel-service"

interface DownloadTemplateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DownloadTemplateDrawer({ open, onOpenChange }: DownloadTemplateDrawerProps) {
  const excelService = new ExcelService()

  const handleDownloadParcelTemplate = () => {
    excelService.downloadParcelTemplate()
  }

  const handleDownloadEPODTemplate = () => {
    excelService.downloadTemplate()
  }

  const templates = [
    {
      id: "parcel",
      title: "Parcel Template",
      description: "Template for creating new parcels with LR Number and Date",
      icon: FileSpreadsheet,
      fields: ["S.No", "LR Number", "LR Date"],
      action: handleDownloadParcelTemplate
    },
    {
      id: "epod",
      title: "EPOD Template", 
      description: "Template for Electronic Proof of Delivery data extraction",
      icon: FileText,
      fields: ["Docket Number", "Consignor Name", "Consignee Name", "Invoice Number", "EwayBill Number", "Number of Boxes", "Signature Present"],
      action: handleDownloadEPODTemplate
    }
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[600px]">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-xl font-semibold">Download Templates</SheetTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            Download CSV templates to prepare your data for upload to the system.
          </div>

          {templates.map((template) => (
            <Card key={template.id} className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <template.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Template Fields:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map((field, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      onClick={template.action}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              💡 Usage Instructions
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Download the appropriate template based on your data type</li>
              <li>• Fill in your data following the column headers</li>
              <li>• For POD matching, ensure document names contain the LR Number</li>
              <li>• Upload the completed template using the upload buttons</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}