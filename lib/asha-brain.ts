import type { Language } from './i18n'
import type {
  CheckIn,
  Difficulty,
  EnergyLevel,
  PainArea,
} from './store'

export interface AshaContext {
  name: string
  language: Language
  todayCheckIn?: CheckIn
  streak: number
}

const areaLabels: Record<Language, Record<PainArea, string>> = {
  en: {
    knees: 'knees',
    lowerBack: 'lower back',
    neckShoulders: 'neck and shoulders',
    hips: 'hips',
    noPain: 'no pain',
  },
  hi: {
    knees: 'घुटनों',
    lowerBack: 'कमर',
    neckShoulders: 'गर्दन और कंधों',
    hips: 'कूल्हों',
    noPain: 'कोई दर्द नहीं',
  },
  hinglish: {
    knees: 'knees',
    lowerBack: 'kamar',
    neckShoulders: 'neck aur shoulders',
    hips: 'hips',
    noPain: 'koi dard nahi',
  },
}

export function labelAreas(
  areas: PainArea[],
  language: Language,
): string {
  return areas
    .map((area) => areaLabels[language][area])
    .join(', ')
}

/**
 * Feedback after the daily check-in.
 */
export function checkInFeedback(
  painAreas: PainArea[],
  painLevel: number,
  energy: EnergyLevel,
  difficulty: Difficulty,
  language: Language,
  name: string,
): string {
  const areas = painAreas.filter((area) => area !== 'noPain')
  const noPain = areas.length === 0 || painLevel <= 1

  const areaText = labelAreas(
    areas.length > 0 ? areas : ['noPain'],
    language,
  )

  if (language === 'hi') {
    if (painLevel >= 8) {
      return `${name}, आपने बहुत तेज़ दर्द बताया है। कृपया आज कोई व्यायाम न करें, आराम करें और अपनी केयर टीम से बात करें। मैं आपके साथ हूँ।`
    }

    if (noPain) {
      return `बहुत अच्छा, ${name}! आज कोई दर्द नहीं है और आप ${
        energy === 'energetic' ? 'ऊर्जावान' : 'आराम में'
      } हैं। आज की दिनचर्या ${
        difficulty === 'active' ? 'थोड़ी सक्रिय' : 'सामान्य'
      } रहेगी। जब आप तैयार हों, शुरू करते हैं।`
    }

    if (difficulty === 'gentle') {
      return `${name}, आपके ${areaText} में ${painLevel}/10 दर्द है। आज हम बहुत हल्की, बैठकर करने वाली गतियाँ करेंगे। धीरे साँस लें और अगर दर्द बढ़े तो तुरंत रुकें।`
    }

    return `धन्यवाद ${name}। आपके ${areaText} में ${painLevel}/10 दर्द है। आज हर गति धीरे करें और अगर दर्द बढ़े तो तुरंत रुकें।`
  }

  if (language === 'hinglish') {
    if (painLevel >= 8) {
      return `${name}, aapne bahut tez dard report kiya hai. Please aaj exercise skip karein, rest karein aur apni care team se baat karein. Main aapke saath hoon.`
    }

    if (noPain) {
      return `Bahut achha, ${name}! Aaj koi pain nahi hai aur aap ${
        energy === 'energetic' ? 'energetic' : 'fresh'
      } feel kar rahe hain. Aaj ki routine ${
        difficulty === 'active' ? 'thodi active' : 'normal'
      } rahegi. Jab ready hon, shuru karte hain.`
    }

    if (difficulty === 'gentle') {
      return `${name}, aapke ${areaText} mein ${painLevel}/10 dard hai. Aaj hum bahut halki seated movements karenge. Dheere breathing karein aur dard badhe to turant ruk jaayein.`
    }

    return `Shukriya ${name}. Aapke ${areaText} mein ${painLevel}/10 dard hai. Aaj har movement dheere karein aur dard badhe to turant ruk jaayein.`
  }

  if (painLevel >= 8) {
    return `${name}, you reported very strong pain. Please skip exercise today, rest, and speak with your care team. I am right here with you.`
  }

  if (noPain) {
    return `Wonderful, ${name}! You have no pain today and feel ${
      energy === 'energetic' ? 'energetic' : 'rested'
    }. Today's routine will be ${
      difficulty === 'active' ? 'a little more active' : 'standard'
    }. When you are ready, let us begin.`
  }

  if (difficulty === 'gentle') {
    return `${name}, your ${areaText} have ${painLevel} out of 10 discomfort today. We will keep every movement gentle and seated. Breathe slowly, and stop immediately if the pain increases.`
  }

  return `Thank you, ${name}. You have ${painLevel} out of 10 discomfort in your ${areaText}. Keep today's movements slow, and stop if the pain increases.`
}

/**
 * Emergency-only fallback.
 *
 * IMPORTANT:
 * Normal questions are NOT matched here.
 * Groq handles normal conversation.
 */
export function mockReply(
  message: string,
  language: Language,
): string {
  const text = message.trim()

  if (!text) {
    return fallback[language]
  }

  const emergency =
    /chest\s*(pain|tightness|pressure)|chest\s*hurts|difficulty\s*(breathing|breath)|trouble\s*breathing|shortness\s*of\s*breath|breathless|can't\s*breathe|cannot\s*breathe|सीने\s*(में)?\s*(दर्द|जकड़न|भारीपन)|साँस\s*(नहीं|लेने में|लेने)|सांस\s*(नहीं|लेने में|लेने)|साँस\s*फूल|सांस\s*फूल|चक्कर|dizziness|dizzy|fainted|fainting|बेहोश/i.test(text)

  if (emergency) {
    if (language === 'hi') {
      return 'कृपया अभी सभी गतिविधियाँ रोककर बैठ जाएँ। अगर सीने में दर्द, साँस लेने में कठिनाई या तेज़ चक्कर है, तो तुरंत अपनी केयर टीम से संपर्क करें या 112 पर कॉल करें।'
    }

    if (language === 'hinglish') {
      return 'Please abhi activity rok kar baith jaayein. Agar chest pain, breathing difficulty ya severe chakkar hai, to turant apni care team se contact karein ya 112 par call karein.'
    }

    return 'Please stop all activity and sit down. If you have chest pain, difficulty breathing, or severe dizziness, contact your care team immediately or call 112.'
  }

  if (language === 'hi') {
    return 'मैं आपकी बात सुन रही हूँ। कृपया अपना सवाल बताइए, मैं आपकी मदद करने की कोशिश करूँगी।'
  }

  if (language === 'hinglish') {
    return 'Main aapki baat sun rahi hoon. Apna sawaal batayein, main aapki help karne ki koshish karungi.'
  }

  return 'I am listening. Please tell me what you would like to know, and I will help you.'
}

const fallback: Record<Language, string> = {
  en: 'I am listening. Please tell me what you would like to know, and I will help you.',
  hi: 'मैं आपकी बात सुन रही हूँ। कृपया बताइए कि आप क्या जानना चाहते हैं, मैं आपकी मदद करूँगी।',
  hinglish:
    'Main aapki baat sun rahi hoon. Batayein aap kya jaana chahte hain, main aapki help karungi.',
}

/**
 * Main Groq system prompt.
 */
export function buildSystemPrompt(
  ctx: AshaContext,
): string {
  const langInstruction =
    ctx.language === 'hi'
      ? 'Respond only in simple Hindi using Devanagari script.'
      : ctx.language === 'hinglish'
        ? 'Respond only in natural Hinglish using Roman/Latin script, mixing simple Hindi and English.'
        : 'Respond only in simple, warm Indian English.'

  const checkin = ctx.todayCheckIn
    ? `
Today's check-in:
- Pain areas: ${ctx.todayCheckIn.painAreas.join(', ')}
- Pain level: ${ctx.todayCheckIn.painLevel}/10
- Energy: ${ctx.todayCheckIn.energy}
- Routine difficulty: ${ctx.todayCheckIn.difficulty}
- Mobility score: ${ctx.todayCheckIn.mobilityScore}
`
    : `
Today's check-in has not been completed yet.
`

  return `
You are Asha, the Kinetic Age AI companion for senior wellness and daily mobility in India.

USER
Name: ${ctx.name}
Age group: older adult (60+)
Current streak: ${ctx.streak} days

${checkin}

LANGUAGE
${langInstruction}

CORE BEHAVIOUR

1. Always answer the user's LATEST message directly.

2. The latest user message has the highest priority.

3. Conversation history is context only. Never let an older message override what the user just asked.

4. Do NOT assume every message is about exercise, pain, mobility, check-ins, health, or wellness.

5. If the user is making normal conversation, respond naturally.

6. If the user says "Hi", "Hello", "Hey", or "Namaste", greet them naturally.

7. If the user asks "How are you?", answer that question naturally.

8. If the user asks "What is my name?", answer using the user's name: ${ctx.name}

9. If the user asks you to speak Hindi, respond in Hindi.

10. If the user asks you to speak Hinglish, respond in Hinglish.

11. Give exercise or lifestyle advice ONLY when it is relevant to the user's question or the user asks for it.

12. Do not diagnose medical conditions.

13. Do not pretend to be a doctor.

14. If the user mentions chest pain, serious breathing difficulty, severe dizziness, fainting, a fall with possible injury, or pain rated 8/10 or higher:
   - Tell them to stop activity.
   - Tell them to sit or rest safely.
   - Recommend contacting their care team.
   - If urgent, recommend calling 112.

15. Never invent personal information about the user.

16. Keep answers concise because the response will be spoken aloud.

17. Do not repeatedly recommend the check-in or 2-minute routine unless relevant.

18. Do not begin every answer with "I hear you".

19. Do not repeat the same response unnecessarily.

20. Do not force an encouraging sentence onto unrelated questions.

PERSONALITY

You are warm, calm, respectful, and conversational.

You are speaking to an older adult, so avoid jargon and complicated explanations.

Answer like a helpful companion, not like a medical textbook.

Most normal questions should receive a normal conversational answer.
`
}
