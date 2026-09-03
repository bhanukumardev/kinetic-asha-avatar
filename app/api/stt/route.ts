import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      console.error(
        '[STT] GROQ_API_KEY is missing',
      )

      return NextResponse.json(
        {
          error:
            'GROQ_API_KEY is missing from .env.local',
        },
        { status: 500 },
      )
    }

    const input = await request.formData()

    const audio = input.get('audio')
    const language = input.get('language')

    if (!(audio instanceof File)) {
      console.error(
        '[STT] No audio File received',
      )

      return NextResponse.json(
        {
          error: 'No audio file received',
        },
        { status: 400 },
      )
    }

    console.log(
      '[STT] Received:',
      audio.name,
      audio.type,
      audio.size,
      'bytes',
    )

    if (audio.size === 0) {
      return NextResponse.json(
        {
          error: 'Audio file is empty',
        },
        { status: 400 },
      )
    }

    const groqForm = new FormData()

    groqForm.append(
      'file',
      audio,
      audio.name || 'voice.webm',
    )

    groqForm.append(
      'model',
      'whisper-large-v3-turbo',
    )

    groqForm.append(
      'response_format',
      'json',
    )

    groqForm.append(
      'temperature',
      '0',
    )

    if (
      typeof language === 'string' &&
      language.trim().length > 0
    ) {
      groqForm.append(
        'language',
        language.trim(),
      )
    }

    console.log(
      '[STT] Sending audio to Groq...',
    )

    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization:
            'Bearer ' + apiKey,
        },
        body: groqForm,
      },
    )

    const responseText =
      await groqResponse.text()

    if (!groqResponse.ok) {
      console.error(
        '[STT] Groq HTTP error:',
        groqResponse.status,
        responseText,
      )

      let groqMessage =
        'Groq transcription request failed'

      try {
        const parsed = JSON.parse(
          responseText,
        ) as {
          error?: {
            message?: string
          }
        }

        if (
          parsed.error &&
          typeof parsed.error.message ===
            'string'
        ) {
          groqMessage =
            parsed.error.message
        }
      } catch {
        if (responseText.trim()) {
          groqMessage = responseText
        }
      }

      return NextResponse.json(
        {
          error: groqMessage,
          status: groqResponse.status,
        },
        { status: 502 },
      )
    }

    let result: {
      text?: string
    }

    try {
      result = JSON.parse(responseText) as {
        text?: string
      }
    } catch {
      console.error(
        '[STT] Invalid Groq JSON:',
        responseText,
      )

      return NextResponse.json(
        {
          error:
            'Groq returned invalid JSON',
        },
        { status: 502 },
      )
    }

    const text =
      typeof result.text === 'string'
        ? result.text.trim()
        : ''

    console.log(
      '[STT] Transcription:',
      text,
    )

    if (!text) {
      return NextResponse.json(
        {
          error: 'No speech detected',
        },
        { status: 422 },
      )
    }

    return NextResponse.json({
      text,
    })
  } catch (error) {
    console.error(
      '[STT] Server exception:',
      error,
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unknown STT server error',
      },
      { status: 500 },
    )
  }
}
