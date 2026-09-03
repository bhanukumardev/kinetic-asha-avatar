'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ArrowLeft, ArrowRight, BatteryFull, BatteryLow, Check, ClipboardCheck, Snowflake, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { checkInFeedback } from '@/lib/asha-brain'
import { computeDifficulty, useAsha, type EnergyLevel, type PainArea } from '@/lib/store'
import { cn } from '@/lib/utils'

interface CheckInProps {
  onAshaSpeak: (text: string) => void
  onRedFlag: () => void
  onComplete: () => void
}

const AREAS: { id: PainArea; icon: string }[] = [
  { id: 'knees', icon: 'K' },
  { id: 'lowerBack', icon: 'B' },
  { id: 'neckShoulders', icon: 'N' },
  { id: 'hips', icon: 'H' },
  { id: 'noPain', icon: '✓' },
]

const ENERGY: { id: EnergyLevel; Icon: typeof Sun }[] = [
  { id: 'energetic', Icon: Sun },
  { id: 'rested', Icon: BatteryFull },
  { id: 'tired', Icon: BatteryLow },
  { id: 'stiff', Icon: Snowflake },
]

export function CheckIn({ onAshaSpeak, onRedFlag, onComplete }: CheckInProps) {
  const { state, t, tf, submitCheckIn, todayCheckIn } = useAsha()
  const [editing, setEditing] = useState(false)
  const [step, setStep] = useState(1)
  const [areas, setAreas] = useState<PainArea[]>([])
  const [pain, setPain] = useState(3)
  const [energy, setEnergy] = useState<EnergyLevel | null>(null)
  const [redFlagAnswer, setRedFlagAnswer] = useState<boolean | null>(null)

  const done = todayCheckIn && !editing

  const toggleArea = (id: PainArea) => {
    setAreas((prev) => {
      if (id === 'noPain') return prev.includes('noPain') ? [] : ['noPain']
      const without = prev.filter((a) => a !== 'noPain')
      return without.includes(id) ? without.filter((a) => a !== id) : [...without, id]
    })
  }

  const painLabel = pain <= 3 ? t.mild : pain <= 6 ? t.moderate : t.severe
  const painTone = pain <= 3 ? 'text-primary' : pain <= 6 ? 'text-warning' : 'text-destructive'

  const canNext = step === 1 ? areas.length > 0 : step === 2 ? redFlagAnswer !== null : energy !== null

  const finish = () => {
    if (!energy) return
    const redFlag = pain >= 8 || redFlagAnswer === true
    const entry = submitCheckIn({ painAreas: areas, painLevel: areas.includes('noPain') ? 0 : pain, energy, redFlag })
    setEditing(false)
    setStep(1)
    if (redFlag) {
      onRedFlag()
      return
    }
    const difficulty = computeDifficulty(entry.painLevel, energy, areas)
    onAshaSpeak(checkInFeedback(areas, entry.painLevel, energy, difficulty, state.language, state.profile.name))
    onComplete()
  }

  const startRedo = () => {
    if (todayCheckIn) {
      setAreas(todayCheckIn.painAreas)
      setPain(todayCheckIn.painLevel || 3)
      setEnergy(todayCheckIn.energy)
      setRedFlagAnswer(false)
    }
    setEditing(true)
    setStep(1)
  }

  const difficultyLabel = (d: 'gentle' | 'standard' | 'active') =>
    d === 'gentle' ? t.difficultyGentle : d === 'standard' ? t.difficultyStandard : t.difficultyActive

  return (
    <section id="check-in" aria-labelledby="checkin-title" className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-8">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardCheck className="size-6" aria-hidden />
          </span>
          <div>
            <h2 id="checkin-title" className="text-2xl text-foreground md:text-3xl">
              {t.checkInTitle}
            </h2>
            <p className="text-base text-muted-foreground">{t.checkInSubtitle}</p>
          </div>
        </div>
        {!done && (
          <span className="mt-2 inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground md:mt-0">
            {tf('step', { n: step })}
          </span>
        )}
      </div>

      {done ? (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-secondary/60 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-6" aria-hidden />
            </span>
            <div>
              <p className="text-xl font-extrabold text-foreground">{t.checkInDone}</p>
              <p className="text-base text-muted-foreground">{t.checkInDoneSub}</p>
              <p className="mt-2 text-base text-foreground">
                <span className="font-semibold">{t.todaysDifficulty}:</span>{' '}
                <span className="rounded-full bg-primary/10 px-3 py-0.5 font-bold text-primary">{difficultyLabel(todayCheckIn.difficulty)}</span>
                <span className="text-muted-foreground"> • {t.painLevel} {todayCheckIn.painLevel}/10</span>
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={startRedo} className="h-12 text-base font-semibold">
            {t.redoCheckIn}
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          <div className="flex gap-2" aria-hidden>
            {[1, 2, 3].map((s) => (
              <span key={s} className={cn('h-2 flex-1 rounded-full transition-colors', s <= step ? 'bg-primary' : 'bg-muted')} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-4"
            >
              {step === 1 && (
                <>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">{t.step1Title}</h3>
                    <p className="text-base text-muted-foreground">{t.step1Hint}</p>
                  </div>
                  <div role="group" aria-label={t.step1Title} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {AREAS.map((a) => {
                      const active = areas.includes(a.id)
                      return (
                        <button
                          key={a.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleArea(a.id)}
                          className={cn(
                            'flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center text-base font-bold transition-all',
                            active ? 'border-primary bg-primary text-primary-foreground shadow-md' : 'border-border bg-background text-foreground hover:border-primary/60'
                          )}
                        >
                          <span className={cn('flex size-10 items-center justify-center rounded-full font-heading text-lg', active ? 'bg-primary-foreground/20' : 'bg-secondary text-secondary-foreground')} aria-hidden>
                            {a.icon}
                          </span>
                          {t[a.id]}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">{t.step2Title}</h3>
                    <p className="text-base text-muted-foreground">{t.step2Hint}</p>
                  </div>
                  <div className="flex flex-col gap-5 rounded-2xl bg-background p-5">
                    <div className="flex items-end justify-between">
                      <span className={cn('font-heading text-6xl font-black leading-none', painTone)} aria-live="polite">
                        {areas.includes('noPain') ? 0 : pain}
                      </span>
                      <span className={cn('rounded-full px-4 py-1.5 text-base font-bold', pain <= 3 ? 'bg-primary/10 text-primary' : pain <= 6 ? 'bg-warning/15 text-warning' : 'bg-destructive/10 text-destructive')}>
                        {painLabel}
                      </span>
                    </div>
                    <Slider
                      value={[pain]}
                      onValueChange={(v) => setPain(Array.isArray(v) ? v[0] ?? 3 : v)}
                      min={1}
                      max={10}
                      step={1}
                      disabled={areas.includes('noPain')}
                      aria-label={t.step2Title}
                      className="py-2 **:data-[slot=slider-thumb]:size-7 **:data-[slot=slider-track]:h-3"
                    />
                    <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                      <span>1 · {t.mild}</span>
                      <span>5 · {t.moderate}</span>
                      <span>10 · {t.severe}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                      <Activity className="size-5 text-warning" aria-hidden />
                      {t.redFlagQuestion}
                    </p>
                    <div role="radiogroup" aria-label={t.redFlagQuestion} className="flex gap-2">
                      {[true, false].map((v) => (
                        <button
                          key={String(v)}
                          type="button"
                          role="radio"
                          aria-checked={redFlagAnswer === v}
                          onClick={() => setRedFlagAnswer(v)}
                          className={cn(
                            'h-12 min-w-20 rounded-full border-2 px-5 text-base font-bold transition-colors',
                            redFlagAnswer === v
                              ? v
                                ? 'border-destructive bg-destructive text-destructive-foreground'
                                : 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-foreground'
                          )}
                        >
                          {v ? t.yes : t.no}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">{t.step3Title}</h3>
                    <p className="text-base text-muted-foreground">{t.step3Hint}</p>
                  </div>
                  <div role="radiogroup" aria-label={t.step3Title} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {ENERGY.map(({ id, Icon }) => {
                      const active = energy === id
                      return (
                        <button
                          key={id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setEnergy(id)}
                          className={cn(
                            'flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-base font-bold transition-all',
                            active ? 'border-teal bg-teal text-teal-foreground shadow-md' : 'border-border bg-background text-foreground hover:border-teal/60'
                          )}
                        >
                          <Icon className="size-8" aria-hidden />
                          {t[id]}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep((s) => s - 1)} className="h-14 px-5 text-base font-semibold">
              <ArrowLeft className="size-5" aria-hidden />
              {t.back}
            </Button>
            {step < 3 ? (
              <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="h-14 px-6 text-base font-bold">
                {t.next}
                <ArrowRight className="size-5" aria-hidden />
              </Button>
            ) : (
              <Button disabled={!canNext} onClick={finish} className="h-14 px-6 text-base font-bold">
                <Check className="size-5" aria-hidden />
                {t.submitCheckIn}
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
