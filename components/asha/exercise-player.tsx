'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Armchair, Check, HandHeart, Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Dictionary } from '@/lib/i18n'
import { useAsha, type Difficulty } from '@/lib/store'
import { cn } from '@/lib/utils'

type ExerciseKey = 'kneeExt' | 'shoulderRolls' | 'ankle' | 'breathing' | 'gentleMarch' | 'neckTurn'

interface Exercise {
  key: ExerciseKey
  title: keyof Dictionary
  desc: keyof Dictionary
  seconds: number
  gentleAlt: ExerciseKey
}

const LIB: Record<ExerciseKey, Exercise> = {
  kneeExt: { key: 'kneeExt', title: 'exKneeExt', desc: 'exKneeExtDesc', seconds: 30, gentleAlt: 'ankle' },
  shoulderRolls: { key: 'shoulderRolls', title: 'exShoulderRolls', desc: 'exShoulderRollsDesc', seconds: 30, gentleAlt: 'breathing' },
  ankle: { key: 'ankle', title: 'exAnkle', desc: 'exAnkleDesc', seconds: 30, gentleAlt: 'breathing' },
  breathing: { key: 'breathing', title: 'exBreathing', desc: 'exBreathingDesc', seconds: 30, gentleAlt: 'breathing' },
  gentleMarch: { key: 'gentleMarch', title: 'exGentleMarch', desc: 'exGentleMarchDesc', seconds: 30, gentleAlt: 'ankle' },
  neckTurn: { key: 'neckTurn', title: 'exNeckTurn', desc: 'exNeckTurnDesc', seconds: 30, gentleAlt: 'breathing' },
}

function buildRoutine(difficulty: Difficulty): Exercise[] {
  if (difficulty === 'gentle') return [LIB.breathing, LIB.ankle, LIB.shoulderRolls, LIB.breathing]
  if (difficulty === 'active') return [LIB.kneeExt, LIB.gentleMarch, LIB.shoulderRolls, LIB.neckTurn]
  return [LIB.kneeExt, LIB.shoulderRolls, LIB.ankle, LIB.breathing]
}

interface ExercisePlayerProps {
  onAshaSpeak: (text: string) => void
}

export function ExercisePlayer({ onAshaSpeak }: ExercisePlayerProps) {
  const { t, tf, todayCheckIn, markExerciseDone } = useAsha()
  const difficulty: Difficulty = todayCheckIn?.difficulty ?? 'standard'
  const [routine, setRoutine] = useState<Exercise[]>(() => buildRoutine(difficulty))
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(routine[0].seconds)
  const [phase, setPhase] = useState<'ready' | 'playing' | 'paused' | 'done'>('ready')
  const [painOpen, setPainOpen] = useState(false)
  const startedRef = useRef(false)
  const spokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (phase !== 'ready') return
    const next = buildRoutine(difficulty)
    setRoutine(next)
    setIndex(0)
    setRemaining(next[0].seconds)
  }, [difficulty, phase])

  const current = routine[index]
  const total = useMemo(() => routine.reduce((s, e) => s + e.seconds, 0), [routine])
  const elapsed = routine.slice(0, index).reduce((s, e) => s + e.seconds, 0) + (current.seconds - remaining)
  const progress = Math.min(100, Math.round((elapsed / total) * 100))

  const finishRoutine = useCallback(() => {
    setPhase('done')
    if (!startedRef.current) return
    markExerciseDone()
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#2E7D32', '#00897B', '#F9A825'] })
    onAshaSpeak(`${t.routineComplete} ${t.routineCompleteSub}`)
  }, [markExerciseDone, onAshaSpeak, t.routineComplete, t.routineCompleteSub])

  const goNext = useCallback(() => {
    if (index + 1 >= routine.length) {
      finishRoutine()
      return
    }
    setIndex((i) => i + 1)
    setRemaining(routine[index + 1].seconds)
  }, [finishRoutine, index, routine])

  useEffect(() => {
    if (phase !== 'playing') return
    const id = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase === 'playing' && remaining === 0) goNext()
  }, [remaining, phase, goNext])

  // Announce each exercise once when it begins
  useEffect(() => {
    if (phase !== 'playing') return
    const id = `${index}-${current.key}`
    if (spokenRef.current === id) return
    spokenRef.current = id
    onAshaSpeak(`${t[current.title]}. ${t[current.desc]}`)
  }, [phase, index, current, onAshaSpeak, t])

  const start = () => {
    startedRef.current = true
    spokenRef.current = null
    setPhase('playing')
  }

  const reset = () => {
    const next = buildRoutine(difficulty)
    setRoutine(next)
    setIndex(0)
    setRemaining(next[0].seconds)
    spokenRef.current = null
    startedRef.current = false
    setPhase('ready')
  }

  const reportPain = () => {
    setPhase('paused')
    setPainOpen(true)
    onAshaSpeak(t.painPausedBody)
  }

  const continueGentle = () => {
    const alt = LIB[current.gentleAlt]
    setRoutine((r) => r.map((e, i) => (i === index ? alt : e)))
    setRemaining(alt.seconds)
    spokenRef.current = null
    setPainOpen(false)
    setPhase('playing')
  }

  const stopForToday = () => {
    setPainOpen(false)
    reset()
  }

  const difficultyLabel = difficulty === 'gentle' ? t.difficultyGentle : difficulty === 'active' ? t.difficultyActive : t.difficultyStandard

  return (
    <section id="routine" aria-labelledby="routine-title" className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-8">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
            <Armchair className="size-6" aria-hidden />
          </span>
          <div>
            <h2 id="routine-title" className="text-2xl text-foreground md:text-3xl">
              {t.routineTitle}
            </h2>
            <p className="text-base text-muted-foreground">{t.routineSubtitle}</p>
          </div>
        </div>
        <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-teal/10 px-3 py-1 text-sm font-bold text-teal md:mt-0">
          {t.todaysDifficulty}: {difficultyLabel}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* Timer */}
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-secondary/50 p-6 lg:w-80">
          <TimerRing remaining={remaining} total={current.seconds} done={phase === 'done'} />
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {phase === 'done' ? t.routineComplete : tf('exerciseOf', { a: index + 1, b: routine.length })}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={phase === 'done' ? 'done' : current.key + index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-1 text-balance font-heading text-2xl font-extrabold text-foreground"
              >
                {phase === 'done' ? t.routineCompleteSub : t[current.title]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Controls + steps */}
        <div className="flex flex-1 flex-col gap-5">
          <div className="rounded-2xl bg-background p-5">
            <p className="text-pretty text-lg leading-relaxed text-foreground">{phase === 'done' ? t.routineCompleteSub : t[current.desc]}</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${phase === 'done' ? 100 : progress}%` }} transition={{ ease: 'linear', duration: 0.6 }} />
            </div>
            <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {routine.map((e, i) => (
                <li
                  key={`${e.key}-${i}`}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold',
                    i < index || phase === 'done' ? 'border-primary/30 bg-primary/10 text-primary' : i === index ? 'border-teal bg-teal/10 text-teal' : 'border-border text-muted-foreground'
                  )}
                >
                  {i < index || phase === 'done' ? <Check className="size-4 shrink-0" aria-hidden /> : <span className="size-4 shrink-0 text-center font-heading" aria-hidden>{i + 1}</span>}
                  <span className="truncate">{t[e.title]}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {phase === 'ready' && (
              <Button onClick={start} className="h-16 flex-1 rounded-full bg-teal px-6 text-lg font-extrabold text-teal-foreground hover:bg-teal/90 sm:flex-none">
                <Play className="size-6 fill-current" aria-hidden />
                {t.startRoutine}
              </Button>
            )}
            {phase === 'playing' && (
              <Button onClick={() => setPhase('paused')} className="h-16 rounded-full px-6 text-lg font-extrabold">
                <Pause className="size-6 fill-current" aria-hidden />
                {t.pause}
              </Button>
            )}
            {phase === 'paused' && (
              <Button onClick={() => setPhase('playing')} className="h-16 rounded-full bg-teal px-6 text-lg font-extrabold text-teal-foreground hover:bg-teal/90">
                <Play className="size-6 fill-current" aria-hidden />
                {t.play}
              </Button>
            )}
            {(phase === 'playing' || phase === 'paused') && (
              <>
                <Button variant="outline" onClick={goNext} className="h-14 rounded-full px-5 text-base font-semibold">
                  <SkipForward className="size-5" aria-hidden />
                  {t.skip}
                </Button>
                <Button variant="destructive" onClick={reportPain} className="h-14 rounded-full px-5 text-base font-bold">
                  <HandHeart className="size-5" aria-hidden />
                  {t.iFeelPain}
                </Button>
              </>
            )}
            {phase === 'done' && (
              <Button variant="outline" onClick={reset} className="h-14 rounded-full px-5 text-base font-semibold">
                <RotateCcw className="size-5" aria-hidden />
                {t.doAgain}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={painOpen} onOpenChange={setPainOpen}>
        <DialogContent className="rounded-3xl bg-card p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <HandHeart className="size-7 text-destructive" aria-hidden />
              {t.painPausedTitle}
            </DialogTitle>
            <DialogDescription className="text-pretty text-base leading-relaxed text-foreground">{t.painPausedBody}</DialogDescription>
          </DialogHeader>
          <p className="rounded-xl bg-secondary px-4 py-3 text-base text-secondary-foreground">
            {t.gentlerAlternative}: <span className="font-bold">{t[LIB[current.gentleAlt].title]}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={continueGentle} className="h-14 text-base font-bold">
              {t.continueGentle}
            </Button>
            <Button variant="outline" onClick={stopForToday} className="h-14 text-base font-semibold">
              {t.stopRoutine}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function TimerRing({ remaining, total, done }: { remaining: number; total: number; done: boolean }) {
  const r = 70
  const c = 2 * Math.PI * r
  const pct = done ? 1 : 1 - remaining / total
  return (
    <div className="relative size-44">
      <svg viewBox="0 0 160 160" className="size-full -rotate-90" aria-hidden>
        <circle cx="80" cy="80" r={r} fill="none" strokeWidth="12" className="stroke-muted" />
        <motion.circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          className={done ? 'stroke-primary' : 'stroke-teal'}
          strokeDasharray={c}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ ease: 'linear', duration: 0.9 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {done ? (
          <Check className="size-14 text-primary" aria-hidden />
        ) : (
          <>
            <span className="font-heading text-5xl font-black leading-none text-foreground" aria-live="off">
              {remaining}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">sec</span>
          </>
        )}
      </div>
    </div>
  )
}
