import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      console.error('[TTS] GROQ_API_KEY is missing')

      return NextResponse.json(
        {
          error:
            'GROQ_API_KEY is missing from .env.local',
        },
        { status: 500 },
      )
    }

    const body = await request.json()

    const text =
      typeof body.text === 'string'
        ? body.text.trim()
        : ''

    if (!text) {
      return NextResponse.json(
        {
          error: 'No text supplied',
        },
        { status: 400 },
      )
    }

    if (text.length > 200) {
      return NextResponse.json(
        {
          error:
            'TTS text must be 200 characters or fewer.',
        },
        { status: 400 },
      )
    }

    console.log('[TTS] Generating:', text)

    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/audio/speech',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model:
            'canopylabs/orpheus-v1-english',
          input: text,
          voice: 'autumn',
          response_format: 'wav',
        }),
      },
    )

    if (!groqResponse.ok) {
      const errorText =
        await groqResponse.text()

      console.error(
        '[TTS] Groq error:',
        groqResponse.status,
        errorText,
      )

      let message =
        'Groq TTS request failed'

      let code: string | undefined

      try {
        const parsed =
          JSON.parse(errorText)

        if (
          typeof parsed?.error?.message ===
          'string'
        ) {
          message =
            parsed.error.message
        }

        if (
          typeof parsed?.error?.code ===
          'string'
        ) {
          code =
            parsed.error.code
        }
      } catch {
        if (errorText.trim()) {
          message = errorText
        }
      }

      return NextResponse.json(
        {
          error: message,
          code,
        },
        { status: 502 },
      )
    }

    const audio =
      await groqResponse.arrayBuffer()

    console.log(
      '[TTS] Generated audio:',
      audio.byteLength,
      'bytes',
    )

    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error(
      '[TTS] Server exception:',
      error,
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unknown TTS server error',
      },
      { status: 500 },
    )
  }
}
