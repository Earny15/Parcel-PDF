import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.NEXT_PUBLIC_CLAUDE_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

export async function POST() {
  try {
    console.log('Testing Claude API connection from server...')
    
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key not configured on server')
      return NextResponse.json(
        { success: false, error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    console.log('API key available:', !!CLAUDE_API_KEY)

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hello, please respond with "API connection successful"'
          }
        ]
      })
    })

    console.log('API test response status:', response.status)

    if (response.ok) {
      const result = await response.json()
      console.log('Claude API test successful')
      return NextResponse.json({ 
        success: true, 
        message: 'Claude API connection successful',
        response: result.content[0].text
      })
    } else {
      const errorText = await response.text()
      console.error('Claude API test failed:', response.status, errorText)
      return NextResponse.json({ 
        success: false, 
        error: `API test failed: ${response.status} - ${errorText}`
      }, { status: response.status })
    }

  } catch (error) {
    console.error('Claude API test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Network error or API unavailable',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Claude API test endpoint is working',
    hasApiKey: !!CLAUDE_API_KEY,
    apiKeyPrefix: CLAUDE_API_KEY ? CLAUDE_API_KEY.substring(0, 10) + '...' : 'Not found'
  })
}