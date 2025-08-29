import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.NEXT_PUBLIC_CLAUDE_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

export async function GET() {
  try {
    console.log('Testing various Claude models to see which are available...')
    
    if (!CLAUDE_API_KEY) {
      return NextResponse.json({ error: 'Claude API key not configured' }, { status: 500 })
    }

    const testModels = [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620', 
      'claude-3-5-haiku-20241022',
      'claude-3-haiku-20240307',
      'claude-3-sonnet-20240229',
      'claude-3-opus-20240229'
    ]

    const availableModels = []
    const unavailableModels = []

    for (const modelName of testModels) {
      try {
        console.log(`Testing model: ${modelName}`)
        
        const response = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: modelName,
            max_tokens: 10,
            messages: [
              {
                role: 'user',
                content: 'test'
              }
            ]
          })
        })

        if (response.ok) {
          availableModels.push(modelName)
          console.log(`✅ ${modelName} is available`)
        } else {
          const errorText = await response.text()
          unavailableModels.push({ model: modelName, error: errorText })
          console.log(`❌ ${modelName} failed: ${response.status}`)
        }
      } catch (error) {
        unavailableModels.push({ model: modelName, error: error.message })
        console.log(`❌ ${modelName} error: ${error.message}`)
      }
    }

    return NextResponse.json({
      availableModels,
      unavailableModels,
      summary: {
        available: availableModels.length,
        unavailable: unavailableModels.length,
        hasVisionCapable: availableModels.some(model => 
          model.includes('sonnet') || model.includes('opus')
        )
      }
    })

  } catch (error) {
    console.error('Model discovery error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}