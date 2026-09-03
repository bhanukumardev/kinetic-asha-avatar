'use client'

import { AlertTriangle, MessageCircle, Phone, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAsha } from '@/lib/store'
import { buildReport, openWhatsApp, sanitizePhone } from '@/lib/whatsapp'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function useSosActions() {
  const { state, todayCheckIn } = useAsha()
  const alertFamily = () => {
    const text = buildReport({
      name: state.profile.name,
      language: state.language,
      streak: state.streak,
      todayCheckIn,
      history: state.checkIns,
      redFlags: state.redFlags,
      audience: 'sos',
    })
    openWhatsApp(text, state.profile.familyNumber || undefined)
  }
  const callCare = () => {
    const num = sanitizePhone(state.profile.careTeamNumber)
    window.location.href = `tel:${num || '112'}`
  }
  const callEmergency = () => {
    window.location.href = 'tel:112'
  }
  return { alertFamily, callCare, callEmergency }
}

/** Clinical red-flag guardrail: pain >= 8, chest tightness, dizziness. */
export function RedFlagDialog({ open, onOpenChange }: DialogProps) {
  const { t } = useAsha()
  const { alertFamily, callCare, callEmergency } = useSosActions()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="rounded-3xl border-2 border-destructive/40 bg-card p-6 text-base sm:max-w-lg">
        <DialogHeader className="items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-9" aria-hidden />
          </span>
          <DialogTitle className="text-2xl text-destructive">{t.redFlagTitle}</DialogTitle>
          <DialogDescription className="text-pretty text-base leading-relaxed text-foreground">{t.redFlagBody}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Button onClick={callCare} className="h-14 text-base font-bold">
            <Phone className="size-5" aria-hidden />
            {t.callCareTeam}
          </Button>
          <Button onClick={alertFamily} className="h-14 bg-whatsapp text-base font-bold text-primary-foreground hover:bg-whatsapp/90">
            <MessageCircle className="size-5" aria-hidden />
            {t.alertFamily}
          </Button>
          <Button onClick={callEmergency} variant="destructive" className="h-14 text-base font-bold">
            <AlertTriangle className="size-5" aria-hidden />
            {t.callEmergency}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-14 text-base font-semibold">
            {t.iAmOkay}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SosDialog({ open, onOpenChange }: DialogProps) {
  const { t } = useAsha()
  const { alertFamily, callCare, callEmergency } = useSosActions()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-card p-6 text-base sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-destructive">
            <ShieldAlert className="size-7" aria-hidden />
            {t.sosTitle}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">{t.sosBody}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Button onClick={callEmergency} variant="destructive" className="h-16 text-lg font-extrabold">
            <Phone className="size-6" aria-hidden />
            {t.callEmergency}
          </Button>
          <Button onClick={callCare} className="h-14 text-base font-bold">
            <Phone className="size-5" aria-hidden />
            {t.callCareTeam}
          </Button>
          <Button onClick={alertFamily} className="h-14 bg-whatsapp text-base font-bold text-primary-foreground hover:bg-whatsapp/90">
            <MessageCircle className="size-5" aria-hidden />
            {t.alertFamily}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
