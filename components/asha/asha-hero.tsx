'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Mic,
  Send,
  Square,
  Volume2,
  VolumeX,
  Brain,
  ShieldAlert,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAsha } from '@/lib/store'
import {
  isSpeechRecognitionSupported,
  listen,
  speak,
  stopSpeaking,
  type RecognitionHandle,
} from '@/lib/speech'
import { cn } from '@/lib/utils'

export type AshaStatus =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'safety'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AshaHeroProps {
  registerSay?: (fn: (text: string) => void) => void
  userName?: string
}

/* =========================================================
   AVATAR
   ========================================================= */

function AshaAvatar({
  status,
}: {
  status: AshaStatus
}) {
  const isListening = status === 'listening'
  const isThinking = status === 'thinking'
  const isSpeaking = status === 'speaking'
  const isSafety = status === 'safety'

  return (
    <div className="relative flex flex-col items-center">

      {/* Outer breathing / speaking aura */}

      <motion.div
        className={cn(
          'absolute rounded-full',
          isSafety
            ? 'bg-destructive/20'
            : isListening
              ? 'bg-teal/20'
              : isThinking
                ? 'bg-warning/20'
                : 'bg-teal/15'
        )}
        animate={
          isSpeaking
            ? {
                width: [190, 220, 190],
                height: [190, 220, 190],
                opacity: [0.25, 0.65, 0.25],
              }
            : isListening
              ? {
                  width: [190, 210, 190],
                  height: [190, 210, 190],
                  opacity: [0.2, 0.5, 0.2],
                }
              : {
                  width: [185, 195, 185],
                  height: [185, 195, 185],
                  opacity: [0.1, 0.25, 0.1],
                }
        }
        transition={{
          duration: isSpeaking ? 0.75 : 2.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Avatar body/head movement */}

      <motion.div
        className="relative z-10"
        animate={
          isSpeaking
            ? {
                y: [0, -2, 0, 1, 0],
                rotate: [0, -0.5, 0.5, 0],
                scale: [1, 1.012, 1, 1.008, 1],
              }
            : isListening
              ? {
                  y: [0, -1, 0],
                  rotate: [0, 0.35, 0],
                }
              : isThinking
                ? {
                    y: [0, -1, 0],
                    rotate: [0, -0.25, 0.25, 0],
                  }
                : {
                    y: [0, -1.5, 0],
                    scale: [1, 1.008, 1],
                  }
        }
        transition={{
          duration: isSpeaking
            ? 1.2
            : isThinking
              ? 1.8
              : 3.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >

        {/* Avatar image */}

        <div
          className={cn(
            'relative size-40 overflow-hidden rounded-full border-4 bg-secondary shadow-xl transition-all duration-300 md:size-48',
            isSafety
              ? 'border-destructive shadow-destructive/20'
              : isListening
                ? 'border-teal shadow-teal/20'
                : isThinking
                  ? 'border-warning shadow-warning/20'
                  : 'border-secondary'
          )}
        >
          <Image
            src="/asha-avatar.png"
            alt="Asha, your Kinetic Age wellness consultant"
            fill
            priority
            sizes="192px"
            className={cn(
              'object-cover transition-all duration-500',
              isSpeaking && 'brightness-[1.02]',
              isListening && 'brightness-[1.04]',
              isThinking && 'brightness-[0.98]',
              isSafety && 'brightness-[0.95]'
            )}
          />

          {/* Very subtle talking overlay */}

          {isSpeaking && (
            <motion.div
              className="pointer-events-none absolute bottom-[22%] left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-foreground/20 blur-[1px]"
              animate={{
                scaleX: [0.7, 1.15, 0.8, 1.25, 0.7],
                scaleY: [0.8, 1.4, 0.9, 1.3, 0.8],
                opacity: [0.15, 0.35, 0.18, 0.3, 0.15],
              }}
              transition={{
                duration: 0.42,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          {/* Safety overlay */}

          {isSafety && (
            <motion.div
              className="absolute inset-0 bg-destructive/10"
              animate={{
                opacity: [0.1, 0.25, 0.1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Listening rings */}

      {isListening && (
        <>
          <motion.div
            className="absolute z-0 rounded-full border-2 border-teal/30"
            animate={{
              width: [160, 220],
              height: [160, 220],
              opacity: [0.7, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />

          <motion.div
            className="absolute z-0 rounded-full border border-teal/20"
            animate={{
              width: [160, 250],
              height: [160, 250],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.3,
            }}
          />
        </>
      )}

      {/* Speaking sound bars */}

      {isSpeaking && (
        <div className="absolute -bottom-5 z-20 flex h-7 items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
            <motion.span
              key={bar}
              className="w-1.5 rounded-full bg-teal"
              animate={{
                height: [
                  5,
                  10 + ((bar * 7) % 13),
                  6,
                  15 + ((bar * 3) % 12),
                  5,
                ],
              }}
              transition={{
                duration: 0.55 + bar * 0.04,
                repeat: Infinity,
                delay: bar * 0.05,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Thinking indicator */}

      {isThinking && (
        <motion.div
          className="absolute -bottom-5 z-20 flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 shadow-sm"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Brain className="size-3.5 text-warning" />

          <span className="text-xs font-semibold text-muted-foreground">
            Thinking
          </span>

          <span className="flex gap-0.5">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="size-1 rounded-full bg-warning"
                animate={{
                  opacity: [0.25, 1, 0.25],
                }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: dot * 0.2,
                }}
              />
            ))}
          </span>
        </motion.div>
      )}

      {/* Safety indicator */}

      {isSafety && (
        <motion.div
          className="absolute -bottom-6 z-20 flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-destructive-foreground shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ShieldAlert className="size-4" />

          <span className="text-xs font-bold">
            Safety alert
          </span>
        </motion.div>
      )}
    </div>
  )
}

/* =========================================================
   MAIN HERO
   ========================================================= */

export function AshaHero({
  registerSay,
  userName,
}: AshaHeroProps) {
  const {
    state,
    t,
    tf,
    setVoiceEnabled,
    todayCheckIn,
  } = useAsha()

  const [status, setStatus] =
    useState<AshaStatus>('idle')

  const [transcript, setTranscript] =
    useState('')

  const [input, setInput] =
    useState('')

  const [messages, setMessages] =
    useState<ChatMessage[]>([])

  const [micSupported, setMicSupported] =
    useState(true)

  const recRef =
    useRef<RecognitionHandle | null>(null)

  const listeningRef =
    useRef(false)

  const askingRef =
    useRef(false)

  const language = state.language
  const voiceEnabled = state.voiceEnabled

  /* =====================================================
     MICROPHONE SUPPORT
     ===================================================== */

  useEffect(() => {
    const supported =
      isSpeechRecognitionSupported()

    setMicSupported(supported)
  }, [])

  /* =====================================================
     LAST ASHA MESSAGE
     ===================================================== */

  const lastAsha =
    [...messages]
      .reverse()
      .find(
        (message) =>
          message.role === 'assistant',
      )?.content ?? t.heroSubtitle

  /* =====================================================
     SPEAK
     ===================================================== */

  const lastSpokenRef =
    useRef('')

  const say = useCallback(
    (text: string) => {
      const cleanText = text.trim()

      if (!cleanText) return

      /*
       * Detect safety language.
       */
      const safety =
        /chest\s*(pain|tightness|pressure)|difficulty\s*breathing|can't\s*breathe|cannot\s*breathe|severe\s*dizziness|fainted|fall|सीने\s*(में)?\s*(दर्द|जकड़न)|सांस\s*(नहीं|मुश्किल)|साँस\s*(नहीं|मुश्किल)|तेज़\s*चक्कर|गिर\s*गया|गिर\s*गई/i.test(
          cleanText,
        )

      setStatus(
        safety ? 'safety' : 'thinking',
      )

      setMessages((current) => {
        const last =
          current[current.length - 1]

        if (
          last?.role === 'assistant' &&
          last.content === cleanText
        ) {
          return current
        }

        return [
          ...current,
          {
            role: 'assistant',
            content: cleanText,
          },
        ]
      })

      if (!voiceEnabled) {
        setStatus(
          safety ? 'safety' : 'idle',
        )
        return
      }

      if (
        lastSpokenRef.current === cleanText
      ) {
        return
      }

      lastSpokenRef.current = cleanText

      stopSpeaking()

      speak(cleanText, language, {
        onStart: () => {
          setStatus(
            safety ? 'safety' : 'speaking',
          )
        },

        onEnd: () => {
          setStatus(
            safety ? 'safety' : 'idle',
          )
        },
      })
    },
    [language, voiceEnabled],
  )

  /* =====================================================
     REGISTER SPEAKER
     ===================================================== */

  useEffect(() => {
    if (!registerSay) return

    registerSay(say)
  }, [registerSay, say])

  /* =====================================================
     CLEANUP
     ===================================================== */

  useEffect(() => {
    return () => {
      listeningRef.current = false
      recRef.current?.stop()
      recRef.current = null
      stopSpeaking()
    }
  }, [])

  /* =====================================================
     ASK ASHA
     ===================================================== */

  const ask = useCallback(
    async (text: string) => {
      const message = text.trim()

      if (!message) return

      if (askingRef.current) {
        return
      }

      askingRef.current = true

      setInput('')
      setTranscript('')

      const historyForRequest =
        messages.slice(-6)

      setMessages((current) => [
        ...current,
        {
          role: 'user',
          content: message,
        },
      ])

      setStatus('thinking')

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        /*
         * This is kept for compatibility with
         * your existing frontend.
         *
         * Your corrected API route should use
         * server-side GROQ_API_KEY in production.
         */
        if (state.groqKey?.trim()) {
          headers['x-groq-key'] =
            state.groqKey.trim()
        }

        const response = await fetch(
          '/api/asha',
          {
            method: 'POST',
            headers,

            body: JSON.stringify({
              message,

              history: historyForRequest,

              context: {
                name:
                  userName ||
                  state.profile.name,

                language,

                streak:
                  state.streak,

                todayCheckIn,
              },
            }),
          },
        )

        let data: {
          reply?: string
          error?: string
        } = {}

        try {
          data = await response.json()
        } catch {
          data = {}
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              `Asha request failed (${response.status})`,
          )
        }

        const replyText =
          data.reply?.trim()

        if (replyText) {
          say(replyText)
        } else {
          say(
            "I'm not sure how to respond to that. Could you try asking differently?",
          )
        }
      } catch (error) {
        console.error(
          'Asha request error:',
          error,
        )

        setStatus('idle')

        say(
          "I'm having trouble connecting right now. Please try again in a moment.",
        )
      } finally {
        askingRef.current = false
      }
    },
    [
      language,
      messages,
      say,
      state.groqKey,
      state.profile.name,
      state.streak,
      todayCheckIn,
      userName,
    ],
  )

  /* =====================================================
     MICROPHONE
     ===================================================== */

  const toggleListening =
    useCallback(async () => {
      if (listeningRef.current) {
        listeningRef.current = false

        recRef.current?.stop()
        recRef.current = null

        setStatus('idle')

        return
      }

      if (status === 'thinking') {
        return
      }

      if (!isSpeechRecognitionSupported()) {
        setMicSupported(false)

        alert(
          'Voice input is not supported in this browser. Please use Chrome or Chromium.',
        )

        return
      }

      stopSpeaking()

      setTranscript('')
      setStatus('listening')
      listeningRef.current = true

      let lastText = ''

      try {
        const handle = await listen(
          language,
          {
            onResult: (
              text: string,
              isFinal: boolean,
            ) => {
              const clean =
                text.trim()

              if (!clean) return

              setTranscript(clean)

              lastText = clean

              if (isFinal) {
                lastText = clean
              }
            },

            onEnd: () => {
              recRef.current = null
              listeningRef.current = false

              const spoken =
                lastText.trim()

              if (spoken) {
                setTranscript(spoken)

                window.setTimeout(() => {
                  void ask(spoken)
                }, 100)
              } else {
                setStatus('idle')
              }
            },

            onError: (error) => {
              console.error(
                'Speech recognition error:',
                error,
              )

              recRef.current = null
              listeningRef.current = false
              setStatus('idle')

              if (
                error === 'not-allowed' ||
                error ===
                  'service-not-allowed'
              ) {
                alert(
                  'Microphone permission was denied. Please allow microphone access.',
                )
              }
            },
          },
        )

        if (!handle) {
          recRef.current = null
          listeningRef.current = false
          setStatus('idle')
          return
        }

        recRef.current = handle
      } catch (error) {
        console.error(
          'Unable to start microphone:',
          error,
        )

        recRef.current = null
        listeningRef.current = false
        setStatus('idle')

        alert(
          'Unable to start the microphone. Please check your browser microphone permission.',
        )
      }
    }, [
      ask,
      language,
      status,
    ])

  /* =====================================================
     TEST VOICE
     ===================================================== */

  const handleTapToSpeak =
    useCallback(() => {
      stopSpeaking()

      lastSpokenRef.current = ''

      const greeting =
        language === 'hi'
          ? 'नमस्ते! मैं आशा हूँ। आज आपके जोड़ कैसे महसूस कर रहे हैं?'
          : language === 'hinglish'
            ? 'Namaste! Main Asha hoon. Aaj aapke joints kaise feel kar rahe hain?'
            : 'Namaste! I am Asha. How are your joints feeling today?'

      speak(greeting, language, {
        onStart: () => {
          setStatus('speaking')
        },

        onEnd: () => {
          setStatus('idle')
        },
      })
    }, [language])

  /* =====================================================
     VOICE TOGGLE
     ===================================================== */

  const toggleVoice =
    useCallback(() => {
      const next = !voiceEnabled

      if (!next) {
        stopSpeaking()
        setStatus('idle')
      }

      setVoiceEnabled(next)
    }, [
      setVoiceEnabled,
      voiceEnabled,
    ])

  /* =====================================================
     GREETING
     ===================================================== */

  const hour =
    new Date().getHours()

  const displayName =
    userName ||
    state.profile.name

  const greeting =
    hour < 12
      ? tf(
          'heroGreetingMorning',
          { name: displayName },
        )
      : hour < 17
        ? tf(
            'heroGreetingAfternoon',
            { name: displayName },
          )
        : tf(
            'heroGreetingEvening',
            { name: displayName },
          )

  /* =====================================================
     STATUS
     ===================================================== */

  const statusLabel: Record<
    AshaStatus,
    string
  > = {
    idle: t.statusIdle,
    listening: t.statusListening,
    thinking: t.statusThinking,
    speaking: t.statusSpeaking,
    safety: 'Safety alert',
  }

  /* =====================================================
     UI
     ===================================================== */

  return (
    <section
      aria-labelledby="asha-hero-title"
      className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-8"
    >
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">

        {/* =================================================
            AVATAR
            ================================================= */}

        <div className="flex shrink-0 flex-col items-center gap-5">

          <AshaAvatar status={status} />

          <div
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all',
              status === 'safety'
                ? 'bg-destructive/10 text-destructive'
                : status === 'listening'
                  ? 'bg-teal/10 text-teal'
                  : status === 'speaking'
                    ? 'bg-teal/10 text-teal'
                    : status === 'thinking'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-secondary text-secondary-foreground',
            )}
          >
            <span
              className={cn(
                'size-2.5 rounded-full bg-current',
                status !== 'idle' &&
                  'animate-pulse',
              )}
            />

            {statusLabel[status]}
          </div>
        </div>

        {/* =================================================
            RIGHT PANEL
            ================================================= */}

        <div className="flex w-full flex-1 flex-col gap-5">

          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-teal">
              Kinetic Asha
            </p>

            <h1
              id="asha-hero-title"
              className="text-balance text-3xl leading-tight text-foreground md:text-4xl"
            >
              {greeting}
            </h1>
          </div>

          {/* Speech */}

          <div
            className={cn(
              'relative rounded-2xl rounded-tl-sm px-5 py-4 transition-all',
              status === 'safety'
                ? 'border border-destructive/30 bg-destructive/10'
                : 'bg-secondary',
            )}
          >
            {status === 'safety' && (
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-destructive">
                <ShieldAlert className="size-4" />
                Please take care of yourself first.
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.p
                key={lastAsha}
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="text-pretty text-lg leading-relaxed"
                aria-live="polite"
              >
                {lastAsha}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* =================================================
              CHECK-IN
              ================================================= */}

          {todayCheckIn && (
            <div className="grid grid-cols-3 gap-2">
              <CheckInCard
                title="Pain"
                value={`${todayCheckIn.painLevel}/10`}
              />

              <CheckInCard
                title="Energy"
                value={todayCheckIn.energy}
              />

              <CheckInCard
                title="Mobility"
                value={String(
                  todayCheckIn.mobilityScore,
                )}
              />
            </div>
          )}

          {/* Listening */}

          {status === 'listening' && (
            <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-dashed border-teal/50 bg-background px-4 py-3">
              <Soundwave />

              <p className="text-base text-muted-foreground">
                {transcript ||
                  t.statusListening}
              </p>
            </div>
          )}

          {/* =================================================
              CONTROLS
              ================================================= */}

          <div className="flex flex-wrap items-center gap-3">

            <button
              type="button"
              onClick={() =>
                void toggleListening()
              }
              disabled={
                !micSupported ||
                status === 'thinking'
              }
              aria-pressed={
                status === 'listening'
              }
              className={cn(
                'relative flex h-16 min-w-16 items-center justify-center gap-3 rounded-full px-6 font-heading text-lg font-extrabold shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50',
                status === 'listening'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-teal text-teal-foreground hover:brightness-110',
              )}
            >
              {status === 'listening' ? (
                <Square className="size-6 fill-current" />
              ) : (
                <Mic className="size-6" />
              )}

              <span>
                {status === 'listening'
                  ? t.stopListening
                  : t.tapToSpeak}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleVoice}
              aria-pressed={voiceEnabled}
              className="flex h-14 items-center gap-2 rounded-full border border-border bg-background px-4 text-base font-semibold text-foreground hover:bg-muted"
            >
              {voiceEnabled ? (
                <Volume2 className="size-5 text-teal" />
              ) : (
                <VolumeX className="size-5 text-muted-foreground" />
              )}

              <span className="hidden sm:inline">
                {voiceEnabled
                  ? t.voiceOn
                  : t.voiceOff}
              </span>
            </button>

            <button
              type="button"
              onClick={handleTapToSpeak}
              className="flex h-14 items-center gap-2 rounded-full border border-border bg-background px-4 text-base font-semibold text-foreground hover:bg-muted"
            >
              <Volume2 className="size-5 text-teal" />

              <span className="hidden sm:inline">
                Test voice
              </span>
            </button>
          </div>

          {/* =================================================
              TEXT INPUT
              ================================================= */}

          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()

              if (
                status === 'thinking'
              ) {
                return
              }

              void ask(input)
            }}
          >
            <label
              htmlFor="asha-input"
              className="sr-only"
            >
              {t.typePlaceholder}
            </label>

            <input
              id="asha-input"
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value,
                )
              }
              placeholder={
                t.typePlaceholder
              }
              autoComplete="off"
              className="h-14 flex-1 rounded-full border border-input bg-background px-5 text-base text-foreground placeholder:text-muted-foreground"
            />

            <Button
              type="submit"
              disabled={
                status === 'thinking' ||
                !input.trim()
              }
              className="h-14 rounded-full px-5 text-base font-bold"
            >
              <Send className="size-5" />

              <span className="sr-only sm:not-sr-only">
                {t.send}
              </span>
            </Button>
          </form>

          {/* =================================================
              QUICK QUESTIONS
              ================================================= */}

          <div className="flex flex-wrap gap-2">
            {[
              t.quickAsk1,
              t.quickAsk2,
              t.quickAsk3,
            ].map((question) => (
              <button
                key={question}
                type="button"
                onClick={() =>
                  void ask(question)
                }
                disabled={
                  status === 'thinking'
                }
                className="min-h-11 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground hover:border-teal hover:text-teal disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>

          {/* Browser warning */}

          {!micSupported && (
            <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3">
              <p className="text-sm font-semibold">
                Voice input is not supported by this browser.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Please use Chrome or Chromium for microphone speech input.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* =========================================================
   CHECK-IN CARD
   ========================================================= */

function CheckInCard({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-background px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>

      <p className="mt-1 truncate text-sm font-bold text-foreground">
        {value}
      </p>
    </div>
  )
}

/* =========================================================
   SOUND WAVE
   ========================================================= */

function Soundwave() {
  return (
    <div
      className="flex h-8 items-center gap-1"
      aria-hidden
    >
      {[0, 1, 2, 3, 4].map(
        (index) => (
          <motion.span
            key={index}
            className="block w-1.5 rounded-full bg-teal"
            animate={{
              height: [
                7,
                20,
                10,
                25,
                7,
              ],
            }}
            transition={{
              duration: 0.7,
              repeat: Infinity,
              delay: index * 0.1,
              ease: 'easeInOut',
            }}
          />
        ),
      )}
    </div>
  )
}
