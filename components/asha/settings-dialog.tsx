'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, KeyRound, Trash2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useAsha } from '@/lib/store'
import { getGroqConfig, isGroqAvailable, GROQ_MODELS, formatSpeed } from '@/lib/groq-config'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
}

export function SettingsDialog({ open, onOpenChange, userName }: SettingsDialogProps) {
  const { state, t, setGroqKey, setProfile, setVoiceEnabled, resetAll } = useAsha()
  const [key, setKey] = useState(state.groqKey)
  const [name, setName] = useState(userName || state.profile.name)
  const [family, setFamily] = useState(state.profile.familyNumber)
  const [physio, setPhysio] = useState(state.profile.physioNumber)
  const [care, setCare] = useState(state.profile.careTeamNumber)
  const [saved, setSaved] = useState(false)
  const [groqConfig, setGroqConfig] = useState<ReturnType<typeof getGroqConfig> | null>(null)

  useEffect(() => {
    if (open) {
      setKey(state.groqKey)
      setName(userName || state.profile.name)
      setFamily(state.profile.familyNumber)
      setPhysio(state.profile.physioNumber)
      setCare(state.profile.careTeamNumber)
      setSaved(false)
      const cfg = getGroqConfig()
      setGroqConfig(cfg)
    }
  }, [open, state, userName])

  const save = () => {
    setGroqKey(key.trim())
    setProfile({ name: name.trim() || 'Friend', familyNumber: family, physioNumber: physio, careTeamNumber: care })
    setSaved(true)
    setTimeout(() => onOpenChange(false), 600)
  }

  const groqAvailable = groqConfig && isGroqAvailable(groqConfig)
  const chatModelInfo = groqConfig ? GROQ_MODELS.chat[groqConfig.chatModel as keyof typeof GROQ_MODELS.chat] : null
  const speechModelInfo = groqConfig ? GROQ_MODELS.speech[groqConfig.speechModel as keyof typeof GROQ_MODELS.speech] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl bg-card p-6 text-base sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t.settingsTitle}</DialogTitle>
          <DialogDescription className="text-base">{t.groqHint}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="patient-name" className="text-base">
              {t.patientName}
            </Label>
            <Input id="patient-name" value={name} onChange={(e) => setName(e.target.value)} className="h-14 text-base" />
          </div>

          {/* Groq AI Configuration */}
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-2 text-base font-bold">
                <Zap className="size-5 text-purple-600" aria-hidden />
                Groq AI Engine
              </Label>
              <Badge variant={groqAvailable ? 'default' : 'secondary'}>
                {groqAvailable ? '✓ Activated' : '○ Built-in'}
              </Badge>
            </div>

            {/* API Key Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="groq-key" className="flex items-center gap-2 text-sm">
                <KeyRound className="size-4" aria-hidden />
                API Key
              </Label>
              <Input
                id="groq-key"
                type="password"
                autoComplete="off"
                placeholder="gsk_..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="h-12 font-mono text-sm"
              />
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`size-2 rounded-full ${groqAvailable ? 'bg-teal-500' : 'bg-amber-500'}`} aria-hidden />
                {groqAvailable ? '🚀 Advanced AI responses enabled' : '📖 Using built-in wellness guidance'}
              </p>
            </div>

            {/* Model Information */}
            {groqAvailable && chatModelInfo && speechModelInfo && (
              <div className="space-y-2 border-t border-purple-200 pt-3">
                <p className="text-xs font-semibold text-gray-700">Optimized Models for Voice Assistant:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Chat Model:</span>
                    <span className="font-medium text-gray-900">{chatModelInfo.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Speed:</span>
                    <span>{formatSpeed(chatModelInfo.speed, 'T/sec')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Speech Model:</span>
                    <span className="font-medium text-gray-900">{speechModelInfo.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Speed:</span>
                    <span>{formatSpeed(speechModelInfo.speed, 'ASH')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Numbers */}
          <div className="flex flex-col gap-3 rounded-2xl bg-secondary/60 p-4">
            <p className="font-heading text-lg font-extrabold">{t.contactsTitle}</p>
            <p className="text-sm text-muted-foreground">{t.contactsHint}</p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="family-number">{t.familyNumber}</Label>
              <Input id="family-number" inputMode="tel" placeholder="91 98765 43210" value={family} onChange={(e) => setFamily(e.target.value)} className="h-14 text-base" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="physio-number">{t.physioNumber}</Label>
              <Input id="physio-number" inputMode="tel" placeholder="91 98765 43210" value={physio} onChange={(e) => setPhysio(e.target.value)} className="h-14 text-base" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="care-number">{t.callCareTeam}</Label>
              <Input id="care-number" inputMode="tel" placeholder="1800 000 0000" value={care} onChange={(e) => setCare(e.target.value)} className="h-14 text-base" />
            </div>
          </div>

          {/* Voice Toggle */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
            <Label htmlFor="voice-toggle" className="text-base">
              {t.voiceLabel}
            </Label>
            <Switch id="voice-toggle" checked={state.voiceEnabled} onCheckedChange={setVoiceEnabled} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="h-14 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                if (window.confirm(t.clearData + '?')) {
                  resetAll()
                  onOpenChange(false)
                }
              }}
            >
              <Trash2 className="size-5" aria-hidden />
              {t.clearData}
            </Button>
            <Button type="button" onClick={save} className="h-14 px-8 text-base font-bold">
              {saved ? <CheckCircle2 className="size-5" aria-hidden /> : null}
              {saved ? t.saved : t.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
