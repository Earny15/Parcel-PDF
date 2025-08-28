import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.NEXT_PUBLIC_CLAUDE_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

export async function POST(request: NextRequest) {
  try {
    console.log('Claude text analysis API route called')
    
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key not configured on server')
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { text, prompt } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      )
    }

    const defaultPrompt = `
Analyze this text extracted from a courier/logistics delivery document and extract the following information in JSON format:

{
  "docketNumber": "the docket/tracking/AWB number",
  "invoiceNumber": "invoice number if present",
  "ewayBillNumber": "eway bill number if present", 
  "receiverName": "name of the receiver/consignee",
  "numberOfBoxes": "total number of boxes/packages (as number)",
  "actualWeight": "actual weight mentioned (include unit like kg)",
  "receiverAddress": "complete address of the receiver including city, pincode",
  "signatureStatus": "Signature Present OR Signature Not Present OR Signature Not Clear",
  "stampStatus": "Available OR Not Available OR Not Clear",
  "damageComments": "any comments about damages, missing items, or delivery condition issues",
  "consignorName": "name of the shipper/consignor",
  "consignorAddress": "complete address of the shipper",
  "deliveryDate": "delivery date if mentioned",
  "gstin": "GSTIN/PAN number if visible"
}

Instructions:
- Extract information from the provided text
- For docketNumber: Look for patterns like "DOCKET NUMBER", tracking numbers, AWB numbers
- For addresses: Extract complete addresses with city and postal codes
- For signatureStatus: Look for mentions of signatures, delivery confirmations
- For stampStatus: Look for mentions of stamps, seals, official marks
- For weights and quantities: Extract numeric values with units
- If any field is not found in the text, use null or empty string
- Return only the JSON object

Here is the text to analyze:

${text}
`

    const requestPrompt = prompt || defaultPrompt

    console.log('Making Claude API request for text analysis...')
    console.log('Text length:', text.length)
    
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Use the working text-only model
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: requestPrompt
          }
        ]
      })
    })

    console.log('Claude text analysis response status:', claudeResponse.status)

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text()
      console.error('Claude text analysis error:', claudeResponse.status, errorText)
      return NextResponse.json(
        { error: `Claude API error: ${claudeResponse.status} - ${errorText}` },
        { status: claudeResponse.status }
      )
    }

    const result = await claudeResponse.json()
    console.log('Claude text analysis response received')
    
    const extractedText = result.content[0].text
    console.log('Claude analysis result:', extractedText)

    // Try to parse JSON response
    try {
      const extractedData = JSON.parse(extractedText)
      return NextResponse.json({ success: true, data: extractedData })
    } catch (parseError) {
      console.warn('Failed to parse JSON from Claude, attempting text parsing:', parseError)
      
      // Try to extract key information using regex if JSON parsing fails
      const parsedData = parseTextResponse(extractedText)
      return NextResponse.json({ 
        success: true, 
        data: parsedData,
        warning: 'Used text parsing instead of JSON'
      })
    }

  } catch (error) {
    console.error('Claude text analysis route error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

function parseTextResponse(text: string): any {
  // Fallback text parsing if JSON fails
  const data: any = {}
  
  // Simple regex patterns to extract required fields
  const patterns = {
    docketNumber: /(?:docket|tracking|awb|consignment)[\s\w]*?(\d{6,})/i,
    invoiceNumber: /(?:invoice|inv)[\s\w]*?([A-Z0-9-]+)/i,
    ewayBillNumber: /(?:eway|e-way|ewb)[\s\w]*?([A-Z0-9]+)/i,
    receiverName: /(?:consignee|receiver|to)[\s:]*([A-Za-z\s]+)/i,
    numberOfBoxes: /(?:boxes|packages|pcs)[\s:]*?(\d+)/i,
    actualWeight: /(?:weight|wt)[\s:]*?([\d.]+\s*(?:kg|gm|grams))/i,
  }

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match && match[1]) {
      data[key] = key === 'numberOfBoxes' ? parseInt(match[1]) : match[1].trim()
    }
  }

  // Look for signature status
  if (/signature.*present|signed/i.test(text)) {
    data.signatureStatus = 'Signature Present'
  } else if (/no.*signature|unsigned/i.test(text)) {
    data.signatureStatus = 'Signature Not Present'
  } else {
    data.signatureStatus = 'Signature Not Clear'
  }
  
  // Look for stamp status
  if (/stamp.*present|stamped/i.test(text)) {
    data.stampStatus = 'Available'
  } else if (/no.*stamp|unstamped/i.test(text)) {
    data.stampStatus = 'Not Available'
  } else {
    data.stampStatus = 'Not Clear'
  }
  
  return data
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Claude text analysis endpoint is working',
    hasApiKey: !!CLAUDE_API_KEY
  })
}