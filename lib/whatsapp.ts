import type { Language } from './i18n'
import { labelAreas } from './asha-brain'
import type { CheckIn, RedFlagEvent } from './store'

export type ReportAudience = 'family' | 'physio' | 'sos'

interface ReportInput {
  name: string
  language: Language
  streak: number
  todayCheckIn?: CheckIn
  history: CheckIn[]
  redFlags: RedFlagEvent[]
  audience: ReportAudience
}

const energyLabel: Record<Language, Record<CheckIn['energy'], string>> = {
  en: { energetic: 'Energetic', rested: 'Rested', tired: 'Tired', stiff: 'Stiff' },
  hi: { energetic: 'ऊर्जावान', rested: 'आरामदायक', tired: 'थके हुए', stiff: 'कड़ापन' },
  hinglish: { energetic: 'Energetic', rested: 'Fresh', tired: 'Thake hue', stiff: 'Stiff' },
}

function formatDate(d = new Date(), language: Language) {
  return d.toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function weeklyStats(history: CheckIn[]) {
  const last7 = history.slice(-7)
  const done = last7.filter((c) => c.exerciseDone).length
  const avgPain = last7.length ? last7.reduce((s, c) => s + c.painLevel, 0) / last7.length : 0
  return { daysActive: last7.length, done, adherence: last7.length ? Math.round((done / 7) * 100) : 0, avgPain: Math.round(avgPain * 10) / 10 }
}

export function buildReport(input: ReportInput): string {
  const { name, language, streak, todayCheckIn: c, history, redFlags, audience } = input
  const date = formatDate(new Date(), language)
  const stats = weeklyStats(history)
  const L = language

  const title =
    audience === 'sos'
      ? L === 'hi' ? '🚨 *आशा - आपातकालीन सूचना*' : L === 'hinglish' ? '🚨 *Asha - Emergency Alert*' : '🚨 *Asha - Emergency Alert*'
      : L === 'hi' ? '🌿 *आशा - दैनिक स्वास्थ्य रिपोर्ट*' : L === 'hinglish' ? '🌿 *Asha - Daily Wellness Report*' : '🌿 *Asha - Daily Wellness Report*'

  const lines: string[] = [title, `*${name}* • ${date}`, '']

  if (audience === 'sos') {
    lines.push(
      L === 'hi'
        ? `${name} को अभी मदद की ज़रूरत हो सकती है। कृपया तुरंत कॉल करें।`
        : L === 'hinglish'
          ? `${name} ko abhi madad ki zaroorat ho sakti hai. Please turant call karein.`
          : `${name} may need help right now. Please call immediately.`
    )
    lines.push('')
  }

  if (c) {
    const areas = c.painAreas.includes('noPain') || c.painAreas.length === 0 ? labelAreas(['noPain'], L) : labelAreas(c.painAreas, L)
    if (L === 'hi') {
      lines.push(`✅ *आज की जाँच*`)
      lines.push(`• दर्द की जगह: ${areas}`)
      lines.push(`• दर्द स्तर: ${c.painLevel}/10`)
      lines.push(`• ऊर्जा: ${energyLabel.hi[c.energy]}`)
      lines.push(`• व्यायाम: ${c.exerciseDone ? 'पूरा ✔' : 'बाकी'}`)
      lines.push('')
      lines.push(`💪 *गतिशीलता स्कोर:* ${c.mobilityScore}/100`)
      lines.push(`🔥 *स्ट्रीक:* ${streak} दिन`)
    } else if (L === 'hinglish') {
      lines.push(`✅ *Aaj ka Check-in*`)
      lines.push(`• Dard ki jagah: ${areas}`)
      lines.push(`• Dard level: ${c.painLevel}/10`)
      lines.push(`• Energy: ${energyLabel.hinglish[c.energy]}`)
      lines.push(`• Routine: ${c.exerciseDone ? 'Done ✔' : 'Pending'}`)
      lines.push('')
      lines.push(`💪 *Mobility Score:* ${c.mobilityScore}/100`)
      lines.push(`🔥 *Streak:* ${streak} din`)
    } else {
      lines.push(`✅ *Today's Check-in*`)
      lines.push(`• Pain areas: ${areas}`)
      lines.push(`• Pain level: ${c.painLevel}/10`)
      lines.push(`• Energy: ${energyLabel.en[c.energy]}`)
      lines.push(`• Routine: ${c.exerciseDone ? 'Completed ✔' : 'Pending'}`)
      lines.push('')
      lines.push(`💪 *Mobility Score:* ${c.mobilityScore}/100`)
      lines.push(`🔥 *Streak:* ${streak} days`)
    }
    if (c.redFlag) {
      lines.push(L === 'hi' ? '⚠️ *रेड फ्लैग:* तेज़ दर्द / सीने में जकड़न / चक्कर की सूचना' : L === 'hinglish' ? '⚠️ *Red Flag:* Tez dard / chest tightness / chakkar report kiya' : '⚠️ *Red Flag:* Severe pain / chest tightness / dizziness reported')
    }
  } else {
    lines.push(L === 'hi' ? 'आज की जाँच अभी बाकी है।' : L === 'hinglish' ? 'Aaj ka check-in abhi pending hai.' : "Today's check-in is still pending.")
  }

  if (audience === 'physio') {
    lines.push('')
    lines.push(L === 'hi' ? `📊 *7 दिन का सारांश*` : `📊 *7-Day Clinical Summary*`)
    lines.push(L === 'hi' ? `• सक्रिय दिन: ${stats.daysActive}/7` : `• Days active: ${stats.daysActive}/7`)
    lines.push(L === 'hi' ? `• नियमितता: ${stats.adherence}%` : `• Adherence: ${stats.adherence}%`)
    lines.push(L === 'hi' ? `• औसत दर्द: ${stats.avgPain}/10` : `• Avg pain: ${stats.avgPain}/10`)
    const trend = history.slice(-7).map((h) => h.painLevel).join(' → ')
    if (trend) lines.push(L === 'hi' ? `• दर्द रुझान: ${trend}` : `• Pain trend: ${trend}`)
    const recent = redFlags.slice(-3)
    lines.push(
      recent.length
        ? (L === 'hi' ? `• रेड फ्लैग (${recent.length}): ` : `• Red flags (${recent.length}): `) + recent.map((r) => r.reason).join('; ')
        : L === 'hi' ? '• रेड फ्लैग: कोई नहीं' : '• Red flags: none'
    )
  }

  lines.push('')
  lines.push(L === 'hi' ? '_काइनेटिक एज आशा द्वारा भेजा गया_' : '_Sent via Kinetic Age Asha_')
  return lines.join('\n')
}

export function sanitizePhone(raw: string) {
  return raw.replace(/[^\d]/g, '')
}

export function whatsappLink(text: string, phone?: string) {
  const encoded = encodeURIComponent(text)
  const p = phone ? sanitizePhone(phone) : ''
  return p ? `https://wa.me/${p}?text=${encoded}` : `https://wa.me/?text=${encoded}`
}

export function openWhatsApp(text: string, phone?: string) {
  const url = whatsappLink(text, phone)
  window.open(url, '_blank', 'noopener,noreferrer')
}
