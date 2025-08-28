"use client"

import { useState } from "react"
import { ArrowLeft, Download, RotateCcw, RotateCw, Maximize2, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface PODDetailsProps {
  parcel: any
  onClose: () => void
}

export function PODDetails({ parcel, onClose }: PODDetailsProps) {
  const [activeTab, setActiveTab] = useState("verification")
  const [comment, setComment] = useState("")
  const [feedback, setFeedback] = useState<Record<string, "positive" | "negative" | null>>({})
  
  // Debug parcel data
  console.log('POD Details - parcel data received:', {
    id: parcel.id,
    awbNumber: parcel.awbNumber,
    signatureStatus: parcel.signatureStatus,
    stampStatus: parcel.stampStatus,
    recipientName: parcel.recipientName,
    recipientAddress: parcel.recipientAddress,
    podProcessed: parcel.podProcessed,
    podFileName: parcel.podFileName
  })

  const handleFeedback = (field: string, type: "positive" | "negative") => {
    setFeedback((prev) => ({
      ...prev,
      [field]: prev[field] === type ? null : type,
    }))
  }

  const verificationFields = [
    {
      id: "awb",
      label: "AWB No.",
      systemValue: parcel.id,
      extractedValue: parcel.awbNumber || parcel.id,
      status: parcel.awbNumber ? "available" : "partial",
    },
    {
      id: "signature",
      label: "Signature Status",
      systemValue: parcel.signaturePresent ? "Signature Present" : "Signature Not Present",
      extractedValue: parcel.signatureStatus || (parcel.signaturePresent ? "Signature Present" : "Signature Not Present"),
      status: getStatusFromValue(parcel.signatureStatus),
    },
    {
      id: "stamp",
      label: "Stamp Status",
      systemValue: parcel.stampStatus || "Available",
      extractedValue: parcel.stampStatus || "Available",
      status: getStatusFromValue(parcel.stampStatus),
    },
    {
      id: "recipientAddress",
      label: "Recipient Address",
      systemValue: parcel.destinationLocation || "N/A",
      extractedValue: parcel.recipientAddress || parcel.destinationLocation || "N/A",
      status: parcel.recipientAddress ? "available" : "partial",
    },
    {
      id: "recipientName",
      label: "Recipient Name",
      systemValue: parcel.destination || "N/A",
      extractedValue: parcel.recipientName || parcel.destination || "N/A",
      status: parcel.recipientName ? "available" : "partial",
    },
  ]

  function getStatusFromValue(value: string | undefined): string {
    if (!value) return "unavailable"
    if (value.toLowerCase().includes("not") || value.toLowerCase().includes("clear")) {
      return "unavailable"
    }
    return "available"
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">POD Details</h1>
              <p className="text-sm text-gray-600">Automatically verify and evaluate POD quality</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="verification" className="bg-blue-600 text-white data-[state=active]:bg-blue-600">
                  Verification Details
                </TabsTrigger>
                <TabsTrigger value="shipment">Shipment Details</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Side - Document Preview */}
        <div className="flex-1 p-6">
          <div className="bg-gray-100 rounded-lg h-full flex flex-col">
            {/* Document Image */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full">
                <img
                  src="/placeholder.svg?height=600&width=800&text=POD Document"
                  alt="POD Document"
                  className="w-full h-auto rounded border"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between p-4 bg-white border-t">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Better POD
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Comment Section */}
            <div className="p-4 bg-white border-t">
              <Textarea
                placeholder="Type your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button className="mt-2 bg-gray-600 hover:bg-gray-700">Add Comment</Button>
            </div>
          </div>
        </div>

        {/* Right Side - Verification Details */}
        <div className="w-96 bg-gray-50 p-6 border-l">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="verification" className="space-y-4">
              {/* User Feedback Section */}
              <Card>
                <CardContent className="p-4">
                  <div className="bg-blue-600 text-white p-3 rounded-lg mb-4">
                    <h3 className="font-medium">User Feedback for Continuous Learning</h3>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`${feedback["general"] === "positive" ? "bg-green-100 border-green-500" : ""}`}
                      onClick={() => handleFeedback("general", "positive")}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`${feedback["general"] === "negative" ? "bg-red-100 border-red-500" : ""}`}
                      onClick={() => handleFeedback("general", "negative")}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Fields */}
              {verificationFields.map((field) => (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{field.label}</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className={`${feedback[field.id] === "positive" ? "bg-green-100 border-green-500" : ""}`}
                          onClick={() => handleFeedback(field.id, "positive")}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className={`${feedback[field.id] === "negative" ? "bg-red-100 border-red-500" : ""}`}
                          onClick={() => handleFeedback(field.id, "negative")}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {field.id === "signature" || field.id === "stamp" ? (
                      <Badge
                        variant={field.status === "available" ? "default" : "secondary"}
                        className={
                          field.status === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {field.systemValue}
                      </Badge>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">System:</span>
                          <span className="text-gray-900">{field.systemValue}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Extracted:</span>
                          <span className="text-gray-900">{field.extractedValue}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="shipment" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Shipment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking No:</span>
                      <span>{parcel.id}</span>
                    </div>
                    {parcel.lrNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">LR Number:</span>
                        <span>{parcel.lrNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span>{parcel.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Carrier:</span>
                      <span>{parcel.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Source:</span>
                      <span>{parcel.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destination:</span>
                      <span>{parcel.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transit Time:</span>
                      <span>{parcel.transitTime}</span>
                    </div>
                    {parcel.actualWeight && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Actual Weight:</span>
                        <span>{parcel.actualWeight}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {parcel.podProcessed && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">POD Processing Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">POD File:</span>
                        <span className="text-blue-600">{parcel.podFileName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processed At:</span>
                        <span>{new Date(parcel.podProcessedAt).toLocaleString()}</span>
                      </div>
                      {parcel.damageComments && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Damage Comments:</span>
                          <span className="text-red-600">{parcel.damageComments}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Additional Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {parcel.status}
                      </Badge>
                    </div>
                    {parcel.ewayBillNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">E-way Bill:</span>
                        <span>{parcel.ewayBillNumber}</span>
                      </div>
                    )}
                    {parcel.invoiceNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice Number:</span>
                        <span>{parcel.invoiceNumber}</span>
                      </div>
                    )}
                    {parcel.numberOfBoxes && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Boxes:</span>
                        <span>{parcel.numberOfBoxes}</span>
                      </div>
                    )}
                    {parcel.lrDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">LR Date:</span>
                        <span>{parcel.lrDate}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {parcel.originalData && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">Original OCR Data</h3>
                    <div className="space-y-2 text-sm">
                      {parcel.originalData.consignorName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Consignor:</span>
                          <span>{parcel.originalData.consignorName}</span>
                        </div>
                      )}
                      {parcel.originalData.consigneeName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Consignee:</span>
                          <span>{parcel.originalData.consigneeName}</span>
                        </div>
                      )}
                      {parcel.originalData.docketNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Original Docket:</span>
                          <span>{parcel.originalData.docketNumber}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
