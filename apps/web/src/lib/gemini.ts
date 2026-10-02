import { GoogleGenerativeAI } from '@google/generative-ai'
import { sendSuperadminErrorAlert } from './telegram'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export interface ParsedRequest {
  title: string
  categoryName: string
  budget: number
  description: string
  district?: string
  hub?: string
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SmartAIResponse {
  status: 'clarify' | 'complete'
  question?: string
  requestParams?: ParsedRequest
}

export async function analyzeRequestFlowWithAI(
  conversation: { role: 'user' | 'model', text: string }[],
  currentHub: string,
  currentDistrict: string,
  maxRetries = 3
): Promise<SmartAIResponse> {
  const fallbackModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite']

  const conversationText = conversation.map(c => `${c.role === 'user' ? 'Пользователь' : 'ИИ'}: ${c.text}`).join('\n')

  const prompt = `
Ты - главный ИИ-ассистент сервиса TuttoMinutto (обратный аукцион услуг и маркетплейс в курортных хабах).
Твоя задача - точно проанализировать диалог и составить качественную карточку запроса с ЧЕТКИМ ИНТЕНТОМ КЛИЕНТА.

ОБЯЗАТЕЛЬНЫЕ ИНТЕНТЫ (используй строго один из префиксов для title):
1. Аренда транспорта (байки, скутеры, авто, NMAX, PCX) -> "СНИМУ В АРЕНДУ:" (например: "СНИМУ В АРЕНДУ: байк NMAX 155cc")
2. Аренда жилья (дома, виллы, кондо, апартаменты) -> "СНИМУ:" (например: "СНИМУ: виллу с бассейном на Раваи")
3. Обмен валют (USDT, рубли, баты, наличные) -> "ОБМЕНЯЮ:" (например: "ОБМЕНЯЮ: 500 USDT на баты")
4. Покупка товаров/вещей -> "КУПЛЮ:" (например: "КУПЛЮ: шлем Shoei Neotec")
5. Заказ услуг (няня, клининг, визы, юристы, ремонт, ивенты) -> "ИЩУ:" или "ЗАКАЖУ:" (например: "ИЩУ: няню для ребенка")

История общения:
${conversationText}

Текущие параметры GPS: Хаб ${currentHub}, Район ${currentDistrict}.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Если пользователь пишет "хочу байк на неделю ббюджет 1500 бат", это АРЕНДА БАЙКА ("СНИМУ В АРЕНДУ: байк на 7 дней"), а НЕ ОБМЕН ВАЛЮТЫ!
2. Бюджет должен быть ЧИСЛОМ (например, 1500, а не 15!). Не разрезай числа на половине.
3. Если информации недостаточно (нет понимания типа услуги или локации), задай один короткий уточняющий вопрос (status: "clarify").
4. Если суть понятна, верни status: "complete" и заполни requestParams.

Верни СТРОГО только JSON следующего формата:
Для уточнения:
{
  "status": "clarify",
  "question": "На какой срок вам нужен байк и в каком районе?"
}

Для завершения:
{
  "status": "complete",
  "requestParams": {
    "title": "СНИМУ В АРЕНДУ: байк на 7 дней (1500 бат/сут)",
    "categoryName": "ПРОКАТ",
    "budget": 1500,
    "description": "Нужен скутер NMAX или аналогичный на 7 дней в районе Patong. Бюджет 1500 THB/сут.",
    "district": "${currentDistrict}",
    "hub": "${currentHub}"
  }
}
`

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (const modelName of fallbackModels) {
      try {
        if (!apiKey) {
          throw new Error('VITE_GEMINI_API_KEY_MISSING: ключ Gemini не передан в .env (VITE_GEMINI_API_KEY)')
        }
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(jsonStr)

        return parsed as SmartAIResponse
      } catch (error: any) {
        console.warn(`Gemini API Warning (${modelName}, Attempt ${attempt}):`, error)
        
        // Throw immediately if key is missing
        if (error?.message?.includes('VITE_GEMINI_API_KEY_MISSING')) {
          throw error
        }

        const isModelDeprecated = error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('no longer available')
        if (isModelDeprecated) {
          // Instantly try the next fallback model without delay
          continue
        }

        const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota')
        if (attempt < maxRetries && (isRateLimit || error?.message?.includes('503') || error?.message?.includes('fetch failed'))) {
          await delay(1000)
          break // Break to the outer attempt loop to retry after delay
        }

        // For other unknown errors, try the next model
      }
    }
  }

  // Intelligent deterministic fallback parser (if all retries and models fail)
  const userMsgs = conversation.filter(c => c.role === 'user').map(c => c.text).join(' ')
  const userText = userMsgs.trim() || 'Запрос на услугу'
  const lowerText = userText.toLowerCase()

  // Extract budget safely
  let extractedBudget = 0
  const budgetMatch = lowerText.match(/(?:бюджет|цена|за)?\s*(\d+[\d\s]*)(?:\s*(?:бат|thb|\$|usd|руб|rub))?/i) || lowerText.match(/(\d{2,6})\s*(?:бат|thb|\$|usd|руб)/i)
  if (budgetMatch && budgetMatch[1]) {
    const parsedNum = parseInt(budgetMatch[1].replace(/\s+/g, ''), 10)
    if (!isNaN(parsedNum) && parsedNum > 0) {
      extractedBudget = parsedNum
    }
  }

  let titleIntent = ''
  let categoryName = 'УСЛУГИ'

  // Check Transport FIRST
  if (/байк|скутер|мото|nmax|pcx|авто|машин|прокат|аренд/i.test(lowerText)) {
    titleIntent = `СНИМУ В АРЕНДУ: ${userText}`
    categoryName = 'ПРОКАТ'
  } else if (/дом|вилл|кондо|апарт|отел|жиль|сним/i.test(lowerText)) {
    titleIntent = `СНИМУ: ${userText}`
    categoryName = 'ЖИЛЬЁ'
  } else if (/нян|сидел|беби|ребен/i.test(lowerText)) {
    titleIntent = `ИЩУ няню: ${userText}`
    categoryName = 'ДЕТИ'
  } else if (/usdt|обмен|крипт|налич|менять|рубли/i.test(lowerText) && !/байк|скутер|авто|дом|вилл/i.test(lowerText)) {
    titleIntent = `ОБМЕНЯЮ валюту: ${userText}`
    categoryName = 'ДЕНЬГИ'
  } else if (/купл|купит|покупк/i.test(lowerText)) {
    titleIntent = `КУПЛЮ: ${userText}`
    categoryName = 'ТОВАРЫ'
  } else if (/клининг|уборк|виз|юрист|масс|мастер|ремонт/i.test(lowerText)) {
    titleIntent = `ЗАКАЖУ: ${userText}`
    categoryName = 'УСЛУГИ'
  } else {
    titleIntent = `ИЩУ: ${userText}`
  }

  // Safe clean title length truncate
  if (titleIntent.length > 55) {
    titleIntent = titleIntent.slice(0, 52) + '...'
  }

  return {
    status: 'complete',
    requestParams: {
      title: titleIntent,
      categoryName,
      budget: extractedBudget,
      description: userText,
      district: currentDistrict,
      hub: currentHub
    }
  }
}
