import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface ModerationResult {
  isAllowed: boolean
  requiresReview: boolean
  riskScore: number // 0.0 to 1.0
  reason: string
  violationCategory?: 'drugs' | 'adult' | 'scam' | 'phishing' | 'spam' | 'other'
  flaggedKeywords?: string[]
}

// 1. Blacklist Regex Rules
const DRUGS_PATTERNS = [
  /\b(?:меф|мефедрон|кокаин|кокс|гашиш|марихуана|бошки|шишки|амфетамин|фен|экстази|мдма|лсд|марки|грибы|соли|спайс|закладка|закладки|клад|шиш|гидра|мефчик)\b/i,
  /\b(?:weed|cannabis|cocaine|meth|heroin| ecstasy|mdma|lsd|mushrooms|hashish|kush)\b/i,
  /(?:д\.р\.о\.г\.и|м\.е\.ф|к\.о\.к\.с)/i,
]

const ADULT_PATTERNS = [
  /\b(?:порно|секс|эскорт|проститутки|интим|массаж\s+с\s+окончанием|минет|досуг|эротика|стриптиз|оргазм|bDSM|свингер)\b/i,
  /\b(?:escort|sex|porn|nude|striptease|prostitution|erotic|happy\s+ending)\b/i,
  /(?:с\.е\.к\.с|э\.с\.к\.о\.р\.т)/i,
]

const SCAM_PATTERNS = [
  /\b(?:быстрый\s+заработок|1000\$\s+в\s+день|заработок\s+без\s+вложений|обналичивание|вывод\s+кредитов|кардинг|дампы|требуются\s+дропы|дропы|пассивный\s+доход\s+100%|пирамида|схема\s+заработка)\b/i,
  /\b(?:easy\s+money|make\s+\$1000\s+daily|carding|dumps|drops\s+needed|guaranteed\s+profit\s+100%)\b/i,
]

const SPAM_LINK_PATTERNS = [
  /(?:https?:\/\/)?(?:t\.me|telegram\.me)\/(?!(?:tuttominutto_bot|tuttominutto_app|tuttominutto))\w+/i,
  /(?:https?:\/\/)?[\w-]+\.(?:xyz|top|work|click|gq|cf|tk|ml|bid|date|racing|stream)\b/i,
]

/**
 * Fast local heuristic checking for instant zero-latency detection.
 */
export function checkHeuristicModeration(title: string, description: string): ModerationResult {
  const combinedText = `${title} ${description}`.toLowerCase()
  const flaggedKeywords: string[] = []

  // Check Drugs
  for (const pattern of DRUGS_PATTERNS) {
    if (pattern.test(combinedText)) {
      flaggedKeywords.push('Запрещенные вещества')
      return {
        isAllowed: false,
        requiresReview: true,
        riskScore: 0.95,
        reason: 'Заявка содержит упоминание запрещенных веществ или препаратов.',
        violationCategory: 'drugs',
        flaggedKeywords,
      }
    }
  }

  // Check Adult Content
  for (const pattern of ADULT_PATTERNS) {
    if (pattern.test(combinedText)) {
      flaggedKeywords.push('Интим / 18+')
      return {
        isAllowed: false,
        requiresReview: true,
        riskScore: 0.90,
        reason: 'Заявка содержит контент 18+ или услуги эскорта.',
        violationCategory: 'adult',
        flaggedKeywords,
      }
    }
  }

  // Check Scam
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(combinedText)) {
      flaggedKeywords.push('Скам / Схемы заработка')
      return {
        isAllowed: false,
        requiresReview: true,
        riskScore: 0.85,
        reason: 'Заявка содержит признаки финансового мошенничества или сомнительных схем.',
        violationCategory: 'scam',
        flaggedKeywords,
      }
    }
  }

  // Check Spam Links
  for (const pattern of SPAM_LINK_PATTERNS) {
    if (pattern.test(combinedText)) {
      flaggedKeywords.push('Сторонние спам-ссылки')
      return {
        isAllowed: true,
        requiresReview: true,
        riskScore: 0.65,
        reason: 'Заявка содержит сторонние ссылки или Telegram-каналы, требующие проверки модератора.',
        violationCategory: 'spam',
        flaggedKeywords,
      }
    }
  }

  return {
    isAllowed: true,
    requiresReview: false,
    riskScore: 0.05,
    reason: 'Текст не содержит явных нарушений.',
  }
}

/**
 * AI Context Moderation using Gemini 3.5 / 3.7 Flash for deep semantic review.
 */
export async function checkAIContextModeration(title: string, description: string): Promise<ModerationResult> {
  const heuristic = checkHeuristicModeration(title, description)
  if (heuristic.riskScore >= 0.80) {
    return heuristic
  }

  if (!genAI || !apiKey) {
    return heuristic
  }

  const prompt = `
Ты — строгое ИИ-ядро модерации маркетплейса услуг TuttoMinutto.
Проанализируй заголовок и описание пользовательской заявки на предмет завуалированных нарушений, спама, скама, продажу наркотиков, проституцию или фишинг.

Заголовок: "${title}"
Описание: "${description}"

Правила:
- Если заявка безопасная (аренда байка, виллы, клининг, ремонт, обмен валюты в отеле, юрист, фотограф, еда) -> isAllowed: true, requiresReview: false, riskScore: 0.05
- Если есть признаки скама, лёгких денег, крипто-пирамид, сомнительных каналов -> isAllowed: false, requiresReview: true, riskScore: 0.75-0.95
- Если есть скрытый подтекст 18+ или наркотиков -> isAllowed: false, requiresReview: true, riskScore: 0.90-1.0

Верни СТРОГО JSON:
{
  "isAllowed": true,
  "requiresReview": false,
  "riskScore": 0.05,
  "reason": "Заявка безопасна",
  "category": "none"
}
`

  const fallbackModels = ['gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.5-pro']

  for (const modelName of fallbackModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(jsonStr)

      if (parsed && typeof parsed.riskScore === 'number') {
        const risk = parsed.riskScore
        const requiresReview = risk >= 0.30 || parsed.requiresReview === true
        const isAllowed = risk < 0.75 && parsed.isAllowed !== false

        return {
          isAllowed,
          requiresReview,
          riskScore: risk,
          reason: parsed.reason || (requiresReview ? 'Отправлено на проверку модератором' : 'Заявка одобрена'),
          violationCategory: parsed.category || 'other',
          flaggedKeywords: risk >= 0.30 ? ['Подозрение ИИ-ядра'] : [],
        }
      }
    } catch (err) {
      console.warn(`Moderation AI Warning (${modelName}):`, err)
      continue
    }
  }

  return heuristic
}

/**
 * Main moderation entry point combining heuristics and AI safety guards.
 */
export async function moderateRequest(title: string, description: string): Promise<ModerationResult> {
  const heuristicResult = checkHeuristicModeration(title, description)
  if (heuristicResult.riskScore >= 0.80) {
    return heuristicResult
  }

  try {
    return await checkAIContextModeration(title, description)
  } catch (e) {
    return heuristicResult
  }
}
