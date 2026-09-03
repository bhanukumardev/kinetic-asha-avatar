'use client'

import { Flame, LogOut, Menu, Settings, Shield, Siren } from 'lucide-react'
import { LANGUAGES } from '@/lib/i18n'
import { useAsha } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface TopNavProps {
  onOpenSettings: () => void
  onOpenSos: () => void
  onLogout?: () => void
  isAdminMode?: boolean
}

export function TopNav({ onOpenSettings, onOpenSos, onLogout, isAdminMode }: TopNavProps) {
  const { state, t, tf, setLanguage } = useAsha()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <span className="font-heading text-xl font-black">K</span>
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center">
                <span className="absolute inline-flex size-full rounded-full bg-teal animate-asha-pulse" />
                <span className="relative inline-flex size-2.5 rounded-full bg-teal ring-2 ring-background" />
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading text-lg font-extrabold text-foreground">{t.brand}</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-teal">
                <span className="size-2 rounded-full bg-teal" aria-hidden />
                {t.ashaActive}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <StreakPill streak={state.streak} label={tf('dayStreak', { n: state.streak })} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 md:justify-end">
          <div
            role="radiogroup"
            aria-label={t.language}
            className="hidden md:flex h-12 items-center rounded-full border border-border bg-card p-1"
          >
            {LANGUAGES.map((l) => {
              const active = state.language === l.code
              return (
                <button
                  key={l.code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setLanguage(l.code)}
                  className={cn(
                    'h-full rounded-full px-3 text-sm font-semibold transition-colors sm:px-4',
                    active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {l.label}
                </button>
              )
            })}
          </div>

          <div className="hidden md:block">
            <StreakPill streak={state.streak} label={tf('dayStreak', { n: state.streak })} />
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label={t.settings}
            className="hidden md:flex size-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
          >
            <Settings className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
            className="md:hidden flex size-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
          >
            <Menu className="size-5" />
          </button>

          <button
            type="button"
            onClick={onOpenSos}
            className="flex h-12 items-center gap-2 rounded-full bg-destructive px-4 font-heading text-base font-extrabold text-destructive-foreground shadow-md transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Siren className="size-5" aria-hidden />
            {t.sos}
          </button>

          {isAdminMode && (
            <div className="hidden md:flex h-12 items-center gap-2 rounded-full bg-primary/15 px-4 text-sm font-bold text-primary">
              <Shield className="size-5" aria-hidden />
              <span>Admin</span>
            </div>
          )}

          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="hidden md:flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="size-4" aria-hidden />
              {isAdminMode ? 'Back' : 'Logout'}
            </button>
          ) : null}

          {isOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md p-4 shadow-xl flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l.code} type="button" onClick={() => { setLanguage(l.code); setIsOpen(false); }} className={cn('rounded-full px-3 py-1.5 text-sm font-semibold', state.language === l.code ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground border border-border')}>{l.label}</button>
                ))}
              </div>
              {isAdminMode && <button type="button" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-sm font-bold text-primary"><Shield className="size-4" /> Admin</button>}
              <button type="button" onClick={() => { onOpenSettings(); setIsOpen(false); }} className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"><Settings className="size-4" /> Settings</button>
              {onLogout && <button type="button" onClick={() => { onLogout(); setIsOpen(false); }} className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"><LogOut className="size-4" /> {isAdminMode ? 'Back' : 'Logout'}</button>}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function StreakPill({ streak, label }: { streak: number; label: string }) {
  return (
    <div className="flex h-12 items-center gap-2 rounded-full bg-warning/15 px-4 text-sm font-bold text-warning">
      <Flame className={cn('size-5', streak > 0 && 'fill-warning')} aria-hidden />
      <span>{label}</span>
    </div>
  )
}
