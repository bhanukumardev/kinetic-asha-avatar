'use client'

import { useEffect, useState } from 'react'
import { getGroqConfig, isGroqAvailable, GROQ_MODELS, formatSpeed } from '@/lib/groq-config'
import { Badge } from '@/components/ui/badge'

export function GroqStatus() {
  const [config, setConfig] = useState<ReturnType<typeof getGroqConfig> | null>(null)

  useEffect(() => {
    const cfg = getGroqConfig()
    setConfig(cfg)
  }, [])

  if (!config) return null

  const available = isGroqAvailable(config)
  const chatModelInfo = GROQ_MODELS.chat[config.chatModel as keyof typeof GROQ_MODELS.chat]
  const speechModelInfo = GROQ_MODELS.speech[config.speechModel as keyof typeof GROQ_MODELS.speech]

  return (
    <div className="space-y-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-3 text-sm">
      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-700">Groq AI Engine</span>
        <Badge variant={available ? 'default' : 'secondary'}>
          {available ? '✓ Active' : '○ Built-in'}
        </Badge>
      </div>

      {/* Models */}
      {available && (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-gray-600">Chat: </span>
            <span className="font-medium text-gray-900">{chatModelInfo?.name || config.chatModel}</span>
            <span className="text-gray-500 ml-1">({formatSpeed(chatModelInfo?.speed || 280, 'T/sec')})</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-600">Speech: </span>
            <span className="font-medium text-gray-900">{speechModelInfo?.name || config.speechModel}</span>
            <span className="text-gray-500 ml-1">({formatSpeed(speechModelInfo?.speed || 400000, 'ASH')})</span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-600">
        {available ? (
          <p>🚀 Advanced AI-powered responses with {formatSpeed(chatModelInfo?.speed || 280, 'T/sec')} speed</p>
        ) : (
          <p>📖 Using built-in wellness guidance. Add Groq API key in settings for AI responses.</p>
        )}
      </div>
    </div>
  )
}
