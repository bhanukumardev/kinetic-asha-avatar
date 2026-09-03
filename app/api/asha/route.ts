import { NextResponse } from 'next/server'
import {
  buildSystemPrompt,
  mockReply,
  type AshaContext,
} from '@/lib/asha-brain'

export const runtime = 'nodejs'

interface Body {
  message: string
  context: AshaContext
  history?: {
    role: 'user' | 'assistant'
    content: string
  }[]
}

interface GroqResponse {
  choices?: {
    message?: {
      content?: string
    }
  }[]
  error?: {
    message?: string
    type?: string
    code?: string
  }
}

export async function POST(req: Request) {
  let body: Body

  // -----------------------------
  // Parse request
  // -----------------------------
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const message =
    typeof body.message === 'string'
      ? body.message.slice(0, 1000).trim()
      : ''

  if (!message) {
    return NextResponse.json(
      { error: 'Empty message' },
      { status: 400 },
    )
  }

  const context = body.context

  if (!context) {
    return NextResponse.json(
      { error: 'Missing Asha context' },
      { status: 400 },
    )
  }

  const language = context.language ?? 'en'

  // -----------------------------
  // GROQ API KEY
  // -----------------------------
  //
  // IMPORTANT:
  // Never use NEXT_PUBLIC_GROQ_API_KEY.
  //
  // NEXT_PUBLIC_* variables are exposed to the browser.
  //
  // The secret must be:
  //
  // GROQ_API_KEY=...
  //
  // inside .env.local / Vercel environment variables.
  //
  const apiKey = process.env.GROQ_API_KEY?.trim() || ''

  console.log(
    '[ASHA] Groq API key:',
    apiKey ? 'FOUND' : 'MISSING',
  )

  // -----------------------------
  // No Groq key
  // -----------------------------
  if (!apiKey) {
    console.error(
      '[ASHA] GROQ_API_KEY is missing. Using emergency-safe fallback.',
    )

    return NextResponse.json({
      reply: mockReply(message, language),
      source: 'fallback',
      model: 'built-in',
      warning: 'GROQ_API_KEY is not configured.',
    })
  }

  // -----------------------------
  // Model
  // -----------------------------
  const chatModel =
    process.env.GROQ_CHAT_MODEL?.trim() ||
    'openai/gpt-oss-20b'

  // -----------------------------
  // Conversation history
  // -----------------------------
  //
  // Keep only the most recent messages.
  // Also validate them so arbitrary objects cannot
  // accidentally enter the Groq request.
  //
  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (item) =>
            item &&
            (item.role === 'user' || item.role === 'assistant') &&
            typeof item.content === 'string' &&
            item.content.trim().length > 0,
        )
        .slice(-8)
        .map((item) => ({
          role: item.role,
          content: item.content.slice(0, 2000),
        }))
    : []

  // -----------------------------
  // System prompt
  // -----------------------------
  const systemPrompt = buildSystemPrompt(context)

  console.log('[ASHA] -----------------------------')
  console.log('[ASHA] Model:', chatModel)
  console.log('[ASHA] Language:', language)
  console.log('[ASHA] User message:', message)
  console.log('[ASHA] History messages:', history.length)
  console.log('[ASHA] Calling Groq...')
  console.log('[ASHA] -----------------------------')

  // -----------------------------
  // Call Groq
  // -----------------------------
  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          model: chatModel,

          temperature: 0.6,

          max_tokens: 220,

          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },

            ...history,

            {
              role: 'user',
              content: message,
            },
          ],
        }),

        signal: AbortSignal.timeout(15000),
      },
    )

    const rawText = await response.text()

    // -----------------------------
    // Groq HTTP error
    // -----------------------------
    if (!response.ok) {
      console.error(
        '[ASHA] Groq HTTP error:',
        response.status,
      )

      console.error(
        '[ASHA] Groq response:',
        rawText,
      )

      let errorMessage = `Groq API returned ${response.status}`

      try {
        const errorData =
          JSON.parse(rawText) as GroqResponse

        if (errorData.error?.message) {
          errorMessage = errorData.error.message
        }
      } catch {
        // Keep generic error message.
      }

      return NextResponse.json({
        reply: mockReply(message, language),
        source: 'fallback',
        model: 'built-in',
        warning: errorMessage,
      })
    }

    // -----------------------------
    // Parse Groq response
    // -----------------------------
    let data: GroqResponse

    try {
      data = JSON.parse(rawText) as GroqResponse
    } catch {
      console.error(
        '[ASHA] Groq returned invalid JSON:',
        rawText,
      )

      return NextResponse.json({
        reply: mockReply(message, language),
        source: 'fallback',
        model: 'built-in',
        warning: 'Groq returned invalid JSON.',
      })
    }

    // -----------------------------
    // Extract assistant response
    // -----------------------------
    const reply =
      data.choices?.[0]?.message?.content?.trim() || ''

    if (!reply) {
      console.error(
        '[ASHA] Groq returned an empty response.',
      )

      return NextResponse.json({
        reply: mockReply(message, language),
        source: 'fallback',
        model: 'built-in',
        warning: 'Groq returned an empty response.',
      })
    }

    console.log('[ASHA] Groq reply:', reply)
    console.log('[ASHA] Groq success')

    // -----------------------------
    // Successful response
    // -----------------------------
    return NextResponse.json({
      reply,
      source: 'groq',
      model: chatModel,
    })
  } catch (error) {
    // -----------------------------
    // Network / timeout error
    // -----------------------------
    console.error('[ASHA] Groq request failed:', error)

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown Groq error'

    return NextResponse.json({
      reply: mockReply(message, language),
      source: 'fallback',
      model: 'built-in',
      warning: `Groq request failed: ${errorMessage}`,
    })
  }
}
