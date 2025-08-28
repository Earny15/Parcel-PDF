"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DeliveredParcel {
  id: string
  orderId: string
  carrier: string
  tags: string[]
  source: string
  sourceLocation: string
  destination: string
  destinationLocation: string
  transitTime: string
  status: string
  ewayBillNumber?: string
  numberOfBoxes?: number
  signaturePresent?: boolean
}

interface DeliveredTableProps {
  parcels: DeliveredParcel[]
  onParcelClick?: (parcel: DeliveredParcel) => void
}

export function DeliveredTable({ parcels, onParcelClick }: DeliveredTableProps) {
  return (
    <div className="bg-white">
      <div className="flex justify-end p-4 border-b">
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            All (34)
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Delivered (31)
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-700">
                <Checkbox />
              </th>
              <th className="text-left p-4 font-medium text-gray-700">TRACKING NO.</th>
              <th className="text-left p-4 font-medium text-gray-700">ORDER ID</th>
              <th className="text-left p-4 font-medium text-gray-700">CARRIER</th>
              <th className="text-left p-4 font-medium text-gray-700">TAGS</th>
              <th className="text-left p-4 font-medium text-gray-700">SOURCE</th>
              <th className="text-left p-4 font-medium text-gray-700">DESTINATION</th>
              <th className="text-left p-4 font-medium text-gray-700">TRANSIT TIME</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((parcel, index) => (
              <tr
                key={parcel.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onParcelClick?.(parcel)}
              >
                <td className="p-4">
                  <Checkbox />
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{parcel.id}</span>
                    <Badge variant="secondary" className="w-fit mt-1 bg-green-100 text-green-800">
                      {parcel.status}
                    </Badge>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-red-500">{parcel.orderId}</span>
                    <span className="text-green-600 text-sm">On Time</span>
                  </div>
                </td>
                <td className="p-4 text-gray-700">{parcel.carrier}</td>
                <td className="p-4">
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 bg-transparent">
                    + ADD TAG
                  </Button>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{parcel.source}</span>
                    <span className="text-sm text-gray-500">{parcel.sourceLocation}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{parcel.destination}</span>
                    <span className="text-sm text-gray-500">{parcel.destinationLocation}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={parcel.transitTime === "N/A" ? "text-red-500" : "text-gray-700"}>
                    {parcel.transitTime}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
