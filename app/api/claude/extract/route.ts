import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.NEXT_PUBLIC_CLAUDE_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

// Mock data function REMOVED - No more dummy data fallbacks

export async function POST(request: NextRequest) {
  try {
    console.log('Claude vision API route called')
    
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key not configured on server')
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { base64Data, mimeType, prompt } = body

    if (!base64Data || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: base64Data, mimeType' },
        { status: 400 }
      )
    }

    // If it's a PDF file, don't try vision models - return error to use text extraction instead
    if (mimeType === 'application/pdf') {
      console.log('PDF file detected - vision route should not be used for PDFs')
      return NextResponse.json(
        { error: 'PDF files should use text extraction route, not vision route' },
        { status: 400 }
      )
    }

    const defaultPrompt = `
Please analyze this courier/logistics delivery document and extract the following information in JSON format:

{
  "docketNumber": "the docket/tracking/AWB number (look for DOCKET NUMBER field or barcode labels)",
  "invoiceNumber": "invoice number if present (look for Invoice No or similar labels)",
  "ewayBillNumber": "eway bill number if present (look for Eway Bill or E-way Bill)", 
  "receiverName": "name of the receiver/consignee (look in Receiver Details section)",
  "numberOfBoxes": "total number of boxes/packages (as number, look for Number of Boxes field)",
  "actualWeight": "actual weight mentioned (include unit like kg, look for Actual Weight or similar)",
  "receiverAddress": "complete address of the receiver including city, pincode (from Receiver Details section)",
  "signatureStatus": "Signature Present OR Signature Not Present OR Signature Not Clear",
  "stampStatus": "Available OR Not Available OR Not Clear",
  "damageComments": "any handwritten comments about damages, missing items, or delivery condition issues",
  "consignorName": "name of the shipper/consignor (look in Shipper Details section)",
  "consignorAddress": "complete address of the shipper (from Shipper Details section)",
  "deliveryDate": "delivery date if mentioned",
  "gstin": "GSTIN/PAN number if visible"
}

Specific extraction guidelines for this document type:
- DOCKET NUMBER: Look for barcode labels or "DOCKET NUMBER" text
- Receiver Details: Usually in a box labeled "Receiver Details" with "To:" prefix
- Shipper Details: Usually in a box labeled "Shipper Details" with "From:" prefix  
- Number of Boxes: Look for "Number of Boxes" field in document details
- Actual Weight: Look for "Actual Weight (kg)" field
- Invoice details: Look for "Invoice No." or similar fields
- E-way Bill: Look for "Eway Bill" numbers

For signature and stamp status:
- signatureStatus: Look in "Proof Of Delivery" section for signatures
  * "Signature Present" - clear, readable signature visible
  * "Signature Not Present" - no signature found
  * "Signature Not Clear" - signature present but illegible
  
- stampStatus: Look for official stamps or seals in delivery proof section
  * "Available" - clear stamp/seal visible
  * "Not Available" - no stamp found
  * "Not Clear" - stamp present but faded/unclear

Return only the JSON object with extracted data.
`

    const requestPrompt = prompt || defaultPrompt

    // Try available models (based on API key test results)
    const visionModels = [
      'claude-3-5-haiku-20241022', // Available with your API key - might have vision
      'claude-3-haiku-20240307'    // Available with your API key - text only
    ]
    
    console.log('Attempting vision-capable models first...')
    let claudeResponse
    let visionWorked = false
    
    for (const modelName of visionModels) {
      try {
        console.log(`Trying vision model: ${modelName}`)
        
        claudeResponse = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: modelName,
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: requestPrompt
                  },
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }
            ]
          })
        })
        
        if (claudeResponse.ok) {
          console.log(`Vision processing successful with model: ${modelName}`)
          visionWorked = true
          break
        } else {
          const errorText = await claudeResponse.text()
          console.log(`Vision model ${modelName} failed: ${errorText}`)
        }
      } catch (error) {
        console.log(`Vision model ${modelName} error:`, error.message)
      }
    }
    
    // If vision models failed, throw error - NO mock data fallback
    if (!visionWorked) {
      console.error('All vision models failed - cannot process image files')
      return NextResponse.json(
        { 
          error: 'Vision model extraction failed', 
          details: 'All Claude vision models are unavailable. Cannot process image files without vision capabilities.',
          recommendation: 'Use PDF files with text content instead of image files, or check Claude API key permissions.'
        },
        { status: 503 }
      )
    }

    console.log('Claude API response status:', claudeResponse.status)

    const result = await claudeResponse.json()
    console.log('Claude API response received')
    
    const extractedText = result.content[0].text
    console.log('Extracted text from Claude:', extractedText)

    // Try to parse JSON response
    try {
      const extractedData = JSON.parse(extractedText)
      return NextResponse.json({ success: true, data: extractedData })
    } catch (parseError) {
      console.warn('Failed to parse JSON, returning raw text:', parseError)
      return NextResponse.json({ 
        success: true, 
        data: { rawText: extractedText },
        warning: 'Could not parse as JSON'
      })
    }

  } catch (error) {
    console.error('Claude API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Test endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'Claude API endpoint is working',
    hasApiKey: !!CLAUDE_API_KEY
  })
}