'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { dictionaries, format, type Dictionary, type Language } from './i18n'

export type PainArea = 'knees' | 'lowerBack' | 'neckShoulders' | 'hips' | 'noPain'
export type EnergyLevel = 'energetic' | 'rested' | 'tired' | 'stiff'
export type Difficulty = 'gentle' | 'standard' | 'active'

export interface CheckIn {
  date: string // YYYY-MM-DD
  painAreas: PainArea[]
  painLevel: number
  energy: EnergyLevel
  redFlag: boolean
  difficulty: Difficulty
  mobilityScore: number
  exerciseDone: boolean
  createdAt: number
}

export interface RedFlagEvent {
  at: number
  reason: string
}

export interface Profile {
  name: string
  familyNumber: string
  physioNumber: string
  careTeamNumber: string
}

export interface AshaState {
  language: Language
  profile: Profile
  groqKey: string
  voiceEnabled: boolean
  streak: number
  lastStreakDate: string | null
  checkIns: CheckIn[]
  redFlags: RedFlagEvent[]
  totalSessions: number
}

const STORAGE_KEY = 'asha.kinetic-age.v1'

const defaultState: AshaState = {
  language: 'en',
  profile: {
    name: 'Asha User',
    familyNumber: '',
    physioNumber: '',
    careTeamNumber: '',
  },
  groqKey: '',
  voiceEnabled: true,
  streak: 0,
  lastStreakDate: null,
  checkIns: [],
  redFlags: [],
  totalSessions: 0,
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return todayKey(d)
}

export function computeDifficulty(painLevel: number, energy: EnergyLevel, painAreas: PainArea[]): Difficulty {
  const noPain = painAreas.includes('noPain') || painLevel <= 1
  if (painLevel >= 6 || energy === 'stiff') return 'gentle'
  if (noPain && (energy === 'energetic' || energy === 'rested')) return 'active'
  if (painLevel <= 3 && energy === 'energetic') return 'active'
  return 'standard'
}

export function computeMobilityScore(painLevel: number, energy: EnergyLevel, painAreas: PainArea[], exerciseDone: boolean): number {
  let score = 100
  const areas = painAreas.filter((a) => a !== 'noPain').length
  score -= areas * 6
  score -= painLevel * 4
  const energyPenalty: Record<EnergyLevel, number> = { energetic: 0, rested: 3, tired: 10, stiff: 14 }
  score -= energyPenalty[energy]
  if (exerciseDone) score += 8
  return Math.max(20, Math.min(100, Math.round(score)))
}

interface AshaContextValue {
  state: AshaState
  hydrated: boolean
  t: Dictionary
  tf: (key: keyof Dictionary, vars?: Record<string, string | number>) => string
  setLanguage: (l: Language) => void
  setProfile: (p: Partial<Profile>) => void
  setGroqKey: (k: string) => void
  setVoiceEnabled: (v: boolean) => void
  submitCheckIn: (data: Omit<CheckIn, 'date' | 'createdAt' | 'difficulty' | 'mobilityScore' | 'exerciseDone'>) => CheckIn
  markExerciseDone: () => void
  logRedFlag: (reason: string) => void
  resetAll: () => void
  todayCheckIn: CheckIn | undefined
}

const AshaContext = createContext<AshaContextValue | null>(null)

export function AshaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AshaState>(defaultState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AshaState>
        setState({ ...defaultState, ...parsed, profile: { ...defaultState.profile, ...(parsed.profile ?? {}) } })
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage may be unavailable (private mode)
    }
  }, [state, hydrated])

  useEffect(() => {
    if (hydrated) document.documentElement.lang = state.language === 'en' ? 'en' : 'hi'
  }, [state.language, hydrated])

  const t = dictionaries[state.language]
  const tf = useCallback(
    (key: keyof Dictionary, vars?: Record<string, string | number>) => format(t[key], vars),
    [t]
  )

  const setLanguage = useCallback((language: Language) => setState((s) => ({ ...s, language })), [])
  const setProfile = useCallback(
    (p: Partial<Profile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    []
  )
  const setGroqKey = useCallback((groqKey: string) => setState((s) => ({ ...s, groqKey })), [])
  const setVoiceEnabled = useCallback((voiceEnabled: boolean) => setState((s) => ({ ...s, voiceEnabled })), [])

  const submitCheckIn = useCallback<AshaContextValue['submitCheckIn']>((data) => {
    const date = todayKey()
    const difficulty = computeDifficulty(data.painLevel, data.energy, data.painAreas)
    const mobilityScore = computeMobilityScore(data.painLevel, data.energy, data.painAreas, false)
    const entry: CheckIn = { ...data, date, difficulty, mobilityScore, exerciseDone: false, createdAt: Date.now() }
    setState((s) => {
      const others = s.checkIns.filter((c) => c.date !== date)
      const existing = s.checkIns.find((c) => c.date === date)
      const merged: CheckIn = existing ? { ...entry, exerciseDone: existing.exerciseDone, mobilityScore: computeMobilityScore(data.painLevel, data.energy, data.painAreas, existing.exerciseDone) } : entry
      let streak = s.streak
      let lastStreakDate = s.lastStreakDate
      if (lastStreakDate !== date) {
        streak = lastStreakDate === yesterdayKey() ? s.streak + 1 : 1
        lastStreakDate = date
      }
      const redFlags = data.redFlag
        ? [...s.redFlags, { at: Date.now(), reason: data.painLevel >= 8 ? `Pain ${data.painLevel}/10` : 'Chest tightness / dizziness' }]
        : s.redFlags
      return { ...s, checkIns: [...others, merged].sort((a, b) => a.date.localeCompare(b.date)).slice(-60), streak, lastStreakDate, redFlags: redFlags.slice(-30) }
    })
    return entry
  }, [])

  const markExerciseDone = useCallback(() => {
    const date = todayKey()
    setState((s) => {
      const checkIns = s.checkIns.map((c) =>
        c.date === date
          ? { ...c, exerciseDone: true, mobilityScore: computeMobilityScore(c.painLevel, c.energy, c.painAreas, true) }
          : c
      )
      return { ...s, checkIns, totalSessions: s.totalSessions + 1 }
    })
  }, [])

  const logRedFlag = useCallback((reason: string) => {
    setState((s) => ({ ...s, redFlags: [...s.redFlags, { at: Date.now(), reason }].slice(-30) }))
  }, [])

  const resetAll = useCallback(() => {
    setState(defaultState)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  const todayCheckIn = useMemo(() => state.checkIns.find((c) => c.date === todayKey()), [state.checkIns])

  const value = useMemo<AshaContextValue>(
    () => ({
      state,
      hydrated,
      t,
      tf,
      setLanguage,
      setProfile,
      setGroqKey,
      setVoiceEnabled,
      submitCheckIn,
      markExerciseDone,
      logRedFlag,
      resetAll,
      todayCheckIn,
    }),
    [state, hydrated, t, tf, setLanguage, setProfile, setGroqKey, setVoiceEnabled, submitCheckIn, markExerciseDone, logRedFlag, resetAll, todayCheckIn]
  )

  return <AshaContext.Provider value={value}>{children}</AshaContext.Provider>
}

export function useAsha() {
  const ctx = useContext(AshaContext)
  if (!ctx) throw new Error('useAsha must be used within AshaProvider')
  return ctx
}
