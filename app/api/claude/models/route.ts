import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.NEXT_PUBLIC_CLAUDE_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

export async function GET() {
  const models = [
    'claude-3-5-sonnet-latest',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620', 
    'claude-3-sonnet-20240229',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307'
  ]

  const results = []

  for (const model of models) {
    try {
      console.log(`Testing model: ${model}`)
      
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ]
        })
      })

      if (response.ok) {
        results.push({ model, status: 'working', response: await response.json() })
      } else {
        const errorText = await response.text()
        results.push({ model, status: 'failed', error: errorText })
      }
    } catch (error) {
      results.push({ model, status: 'error', error: error.message })
    }
  }

  return NextResponse.json({ results })
}