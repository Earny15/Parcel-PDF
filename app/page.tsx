"use client"

import { useState } from "react"
import { Search, Filter, MoreVertical, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UploadEPODDrawer } from "@/components/import-drawer"
import { UploadPODDrawer } from "@/components/upload-pod-drawer"
import { DeliveredTable } from "@/components/delivered-table"
import { PODDetails } from "@/components/pod-details"
import { DownloadTemplateDrawer } from "@/components/download-template-drawer"
import { ExcelService } from "@/lib/excel-service"

export default function CourierDashboard() {
  const [importDrawerOpen, setImportDrawerOpen] = useState(false)
  const [deliveredParcels, setDeliveredParcels] = useState([
    {
      id: "22222222",
      orderId: "N/A",
      carrier: "RoaDo demo Bangalore...",
      tags: [],
      source: "ABC Pvt Ltd",
      sourceLocation: "Bengaluru - 560001",
      destination: "ABXYZ",
      destinationLocation: "Kolkata - 700010",
      transitTime: "N/A",
      status: "DELIVERED",
    },
    {
      id: "859764",
      orderId: "N/A",
      carrier: "RoaDo demo Bangalore...",
      tags: [],
      source: "ABXYZ",
      sourceLocation: "Bangalore - 560001",
      destination: "ABC Pvt Ltd",
      destinationLocation: "Bengaluru - 560001",
      transitTime: "1 day",
      status: "DELIVERED",
    },
  ])

  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false)
  const [uploadPODDrawerOpen, setUploadPODDrawerOpen] = useState(false)
  const [downloadTemplateDrawerOpen, setDownloadTemplateDrawerOpen] = useState(false)
  const [extractedData, setExtractedData] = useState<any[]>([])
  const [selectedParcel, setSelectedParcel] = useState<any>(null)

  const handleOCRComplete = (extractedData: any[]) => {
    const newParcels = extractedData.map((data, index) => ({
      id: data.id || data.lrNumber || `AUTO-${Date.now()}-${index}`,
      orderId: data.orderId || "N/A",
      carrier: data.carrier || "Template Import",
      tags: data.tags || [],
      source: data.source || data.consignorName || "",
      sourceLocation: data.sourceLocation || "",
      destination: data.destination || data.consigneeName || "",
      destinationLocation: data.destinationLocation || "",
      transitTime: data.transitTime || "N/A",
      status: data.status || "DELIVERED",
      lrNumber: data.lrNumber,
      lrDate: data.lrDate,
      ewayBillNumber: data.ewayBillNumber,
      numberOfBoxes: data.numberOfBoxes,
      signaturePresent: data.signaturePresent,
    }))

    setDeliveredParcels((prev) => [...prev, ...newParcels])
  }

  const handlePODComplete = (extractedData: any[]) => {
    // POD processing now updates existing parcels, so we don't create new ones
    console.log('POD processing completed:', extractedData)
    
    // Show success/failure summary
    const successCount = extractedData.filter(item => item.matchedParcel).length
    const totalCount = extractedData.length
    
    if (successCount > 0) {
      const message = `Successfully processed ${successCount} out of ${totalCount} files. ${successCount} parcels updated with POD data.`
      console.log(message)
      // In a real app, you might show a toast notification here
    } else {
      console.warn(`No parcels were updated. Processed ${totalCount} files but none matched existing parcels.`)
    }
  }

  const handleParcelUpdate = (updatedParcel: any) => {
    console.log('handleParcelUpdate called with:', updatedParcel)
    console.log('Current delivered parcels before update:', deliveredParcels)
    
    setDeliveredParcels(prev => {
      const updated = prev.map(parcel => 
        parcel.id === updatedParcel.id ? updatedParcel : parcel
      )
      console.log('Updated delivered parcels:', updated)
      return updated
    })
  }

  const handleDownloadReport = () => {
    console.log('Generating comprehensive report for parcels:', deliveredParcels)
    
    const podProcessedCount = deliveredParcels.filter(p => p.podProcessed).length
    console.log(`Report will include ${deliveredParcels.length} parcels (${podProcessedCount} with POD data)`)
    
    const excelService = new ExcelService()
    excelService.downloadComprehensiveReport(deliveredParcels)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-900">Courier</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Branch</span>
              <Select defaultValue="all-branches">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-branches">All Branches</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search..." className="pl-10 w-64" />
            </div>
            <Button onClick={() => setUploadDrawerOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Parcels
            </Button>
            <Button
              onClick={() => setUploadPODDrawerOpen(true)}
              className="bg-blue-900 hover:bg-blue-800"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload POD
            </Button>
            <Button
              onClick={() => setDownloadTemplateDrawerOpen(true)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button
              onClick={handleDownloadReport}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <div className="relative">
              <Badge variant="secondary" className="absolute -top-2 -right-2 bg-red-500 text-white">
                301
              </Badge>
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="CREATED ON - ALL" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">CREATED ON - ALL</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="DELIVERED ON - ALL" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">DELIVERED ON - ALL</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="PARCEL TYPE - ALL" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">PARCEL TYPE - ALL</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="package">Package</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="PARCEL STATE - ALL" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">PARCEL STATE - ALL</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            ADD FILTER
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <Tabs defaultValue="delivered" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-transparent border-b rounded-none h-auto p-0">
            <TabsTrigger
              value="draft"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              DRAFT (29)
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              PENDING (20)
            </TabsTrigger>
            <TabsTrigger
              value="transit"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              IN TRANSIT (3)
            </TabsTrigger>
            <TabsTrigger
              value="delivered"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              DELIVERED (34)
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              CANCELLED (0)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="delivered" className="mt-0">
            <DeliveredTable parcels={deliveredParcels} onParcelClick={setSelectedParcel} />
          </TabsContent>

          <TabsContent value="draft">
            <div className="p-8 text-center text-gray-500">Draft parcels will be displayed here</div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="p-8 text-center text-gray-500">Pending parcels will be displayed here</div>
          </TabsContent>

          <TabsContent value="transit">
            <div className="p-8 text-center text-gray-500">In transit parcels will be displayed here</div>
          </TabsContent>

          <TabsContent value="cancelled">
            <div className="p-8 text-center text-gray-500">Cancelled parcels will be displayed here</div>
          </TabsContent>
        </Tabs>
      </div>

      <UploadEPODDrawer
        open={uploadDrawerOpen}
        onOpenChange={setUploadDrawerOpen}
        onOCRComplete={handleOCRComplete}
        onDataExtracted={setExtractedData}
      />

      <UploadPODDrawer
        open={uploadPODDrawerOpen}
        onOpenChange={setUploadPODDrawerOpen}
        onPODComplete={handlePODComplete}
        deliveredParcels={deliveredParcels}
        onParcelUpdate={handleParcelUpdate}
      />

      <DownloadTemplateDrawer
        open={downloadTemplateDrawerOpen}
        onOpenChange={setDownloadTemplateDrawerOpen}
      />

      {selectedParcel && <PODDetails parcel={selectedParcel} onClose={() => setSelectedParcel(null)} />}
    </div>
  )
}
