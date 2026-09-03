'use client'

import { useMemo, useState } from 'react'
import { Copy, HeartPulse, MessageCircle, Stethoscope, UserRound, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAsha } from '@/lib/store'
import { buildReport, openWhatsApp, weeklyStats } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

type ViewMode = 'senior' | 'family' | 'physio'

export function ReportCard() {
  const { state, t, tf, todayCheckIn } = useAsha()
  const [view, setView] = useState<ViewMode>('senior')
  const [copied, setCopied] = useState(false)

  const stats = useMemo(() => weeklyStats(state.checkIns), [state.checkIns])

  const reportText = useMemo(
    () =>
      buildReport({
        name: state.profile.name,
        language: state.language,
        streak: state.streak,
        todayCheckIn,
        history: state.checkIns,
        redFlags: state.redFlags,
        audience: view === 'physio' ? 'physio' : 'family',
      }),
    [state.checkIns, state.language, state.profile.name, state.redFlags, state.streak, todayCheckIn, view]
  )

  const shareNow = () => {
    const phone = view === 'physio' ? state.profile.physioNumber : state.profile.familyNumber
    openWhatsApp(reportText, phone || undefined)
  }

  const copyNow = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(reportText)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  const cards = [
    {
      key: 'senior',
      label: t.viewSenior,
      icon: UserRound,
      accent: 'bg-primary/10 text-primary',
    },
    {
      key: 'family',
      label: t.viewFamily,
      icon: Users,
      accent: 'bg-teal/10 text-teal',
    },
    {
      key: 'physio',
      label: t.viewPhysio,
      icon: Stethoscope,
      accent: 'bg-warning/15 text-warning',
    },
  ] as const

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HeartPulse className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl text-foreground md:text-3xl">{t.reportTitle}</h2>
            <p className="text-base text-muted-foreground">{t.reportSubtitle}</p>
          </div>
        </div>
        <div className="inline-flex rounded-full border border-border bg-background p-1">
          {cards.map(({ key, label, icon: Icon, accent }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition-all',
                view === key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <SummaryCard label={t.mobilityScore} value={`${todayCheckIn?.mobilityScore ?? 0}/100`} tone="primary" />
        <SummaryCard label={t.adherence} value={`${stats.adherence}%`} tone="teal" />
        <SummaryCard label={t.avgPain} value={`${stats.avgPain}/10`} tone="warning" />
        <SummaryCard label={t.daysActive} value={`${stats.daysActive}`} tone="muted" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl bg-secondary/70 p-4">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">{view === 'physio' ? t.clinicalNotes : t.todaySummary}</p>
          <div className="whitespace-pre-wrap rounded-2xl bg-background p-4 text-sm leading-7 text-foreground shadow-inner">
            {reportText}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">{t.stakeholderSenior}</p>
            <div className="mt-3 space-y-2 text-base text-foreground">
              <p>
                <span className="font-semibold">{t.painLevel}:</span> {todayCheckIn ? `${todayCheckIn.painLevel}/10` : t.notCheckedIn}
              </p>
              <p>
                <span className="font-semibold">{t.energy}:</span> {todayCheckIn ? t[todayCheckIn.energy] : t.notCheckedIn}
              </p>
              <p>
                <span className="font-semibold">{t.exerciseDone}:</span> {todayCheckIn ? (todayCheckIn.exerciseDone ? t.exerciseDone : t.exercisePending) : t.notCheckedIn}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">{t.redFlagLog}</p>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              {state.redFlags.length ? (
                state.redFlags.slice(-3).map((flag, idx) => (
                  <li key={`${flag.at}-${idx}`} className="rounded-xl bg-destructive/5 px-3 py-2 text-destructive">
                    {new Date(flag.at).toLocaleDateString()} • {flag.reason}
                  </li>
                ))
              ) : (
                <li className="rounded-xl bg-secondary px-3 py-2 text-secondary-foreground">{t.noRedFlags}</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={shareNow} className="h-14 rounded-full bg-whatsapp px-6 text-base font-extrabold text-primary-foreground hover:bg-whatsapp/90">
          <MessageCircle className="size-5" aria-hidden />
          {view === 'physio' ? t.sharePhysio : t.shareFamily}
        </Button>
        <Button variant="outline" onClick={copyNow} className="h-14 rounded-full px-6 text-base font-semibold">
          <Copy className="size-5" aria-hidden />
          {copied ? t.copied : t.copyReport}
        </Button>
      </div>
    </section>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: 'primary' | 'teal' | 'warning' | 'muted' }) {
  const toneClasses = {
    primary: 'bg-primary/10 text-primary',
    teal: 'bg-teal/10 text-teal',
    warning: 'bg-warning/10 text-warning',
    muted: 'bg-muted text-foreground',
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-bold', toneClasses[tone])}>{label}</div>
      <p className="mt-3 font-heading text-3xl font-black text-foreground">{value}</p>
    </div>
  )
}
