/**
 * Groq API Configuration
 * Models optimized for voice assistant use cases
 */

export interface GroqConfig {
  apiKey: string | null
  chatModel: string
  speechModel: string
  chatSpeed: number // Tokens per second
  speechSpeed: number // Audio samples handled per second
}

/**
 * Get Groq configuration from environment
 * Recommended models for best voice assistant experience:
 * - Chat: llama-3.3-70b-versatile (280 T/sec, high quality responses)
 * - Speech: whisper-large-v3-turbo (400K ASH, fastest transcription)
 */
export function getGroqConfig(): GroqConfig {
  return {
    apiKey: typeof window === 'undefined' 
      ? process.env.NEXT_PUBLIC_GROQ_API_KEY || null
      : window.location.hostname === 'localhost' 
        ? localStorage.getItem('groq_api_key') || process.env.NEXT_PUBLIC_GROQ_API_KEY || null
        : process.env.NEXT_PUBLIC_GROQ_API_KEY || null,
    chatModel: process.env.NEXT_PUBLIC_GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile',
    speechModel: process.env.NEXT_PUBLIC_GROQ_SPEECH_MODEL || 'whisper-large-v3-turbo',
    chatSpeed: 280, // T/sec for llama-3.3-70b-versatile
    speechSpeed: 400000, // ASH for whisper-large-v3-turbo
  }
}

/**
 * Model information and capabilities
 */
export const GROQ_MODELS = {
  chat: {
    'llama-3.3-70b-versatile': {
      name: 'Llama 3.3 70B Versatile',
      speed: 280,
      unit: 'T/sec',
      quality: 'high',
      contextWindow: 131072,
      recommended: true,
      description: 'Best for high-quality conversational responses. Excellent balance of speed and quality.',
    },
    'llama-3.1-8b-instant': {
      name: 'Llama 3.1 8B Instant',
      speed: 560,
      unit: 'T/sec',
      quality: 'good',
      contextWindow: 131072,
      recommended: false,
      description: 'Faster but lower quality. Use if speed is priority.',
    },
    'openai/gpt-oss-20b': {
      name: 'OpenAI GPT-OSS 20B',
      speed: 1000,
      unit: 'T/sec',
      quality: 'good',
      contextWindow: 131072,
      recommended: false,
      description: 'Fastest model. Good for quick responses.',
    },
  },
  speech: {
    'whisper-large-v3-turbo': {
      name: 'Whisper Large V3 Turbo',
      speed: 400000,
      unit: 'ASH',
      accuracy: 'high',
      recommended: true,
      description: 'Fastest Whisper model. Best for real-time voice transcription.',
    },
    'whisper-large-v3': {
      name: 'Whisper Large V3',
      speed: 200000,
      unit: 'ASH',
      accuracy: 'highest',
      recommended: false,
      description: 'Highest accuracy Whisper model. Slower than Turbo.',
    },
  },
} as const

/**
 * Validate Groq API key
 */
export async function validateGroqApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Check if Groq API is available
 */
export function isGroqAvailable(config: GroqConfig): boolean {
  return Boolean(config.apiKey)
}

/**
 * Format speed display
 */
export function formatSpeed(speed: number, unit: string): string {
  if (unit === 'T/sec') {
    return `${speed.toLocaleString()} tokens/sec`
  }
  if (unit === 'ASH') {
    return `${(speed / 1000).toLocaleString()}K audio samples/hour`
  }
  return `${speed} ${unit}`
}
