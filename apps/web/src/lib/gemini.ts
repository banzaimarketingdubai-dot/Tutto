import { GoogleGenerativeAI } from '@google/generative-ai'
import { sendSuperadminErrorAlert } from './telegram'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

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
  errorMsg?: string
}

export function cleanUserText(rawText: string): string {
  let cleaned = rawText
    .replace(/\b(?:привет|приветик|здравствуйте|добрый\s+день|добрый\s+вечер|слушай|слушайте|короче|в\s+общем|типа|пожалуйста|подскажи|поскажи|мне\s+бы|хотел\s+бы|хочу|нужно|нужен|нужна|требуется|ищу|закажу|сдайте|дайте|ребят|ребята|всем)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^[,\.\!\?\:\-\s]+/, '')
    .trim()

  if (!cleaned) cleaned = rawText.trim()
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

export async function analyzeRequestFlowWithAI(
  conversation: { role: 'user' | 'model', text: string }[],
  currentHub: string,
  currentDistrict: string,
  maxRetries = 2
): Promise<SmartAIResponse> {
  const fallbackModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']

  const conversationText = conversation.map(c => `${c.role === 'user' ? 'Пользователь' : 'ИИ'}: ${c.text}`).join('\n')

  const prompt = `
Ты - главный ИИ-ассистент сервиса TuttoMinutto (обратный аукцион услуг и маркетплейс в курортных хабах).
Твоя задача - извлечь из разговорной речи пользователя параметры запроса, ПОЛНОСТЬЮ УБРАТЬ РАЗГОВОРНЫЙ МУСОР И ВВОДНЫЕ СЛОВА ("привет", "слушай", "короче", "в общем", "типа", "мне бы", "хотел узнать", "напиши") и составить КРАТКУЮ, ЧЕТКУЮ профессиональную карточку запроса.

Текущие параметры GPS пользователя: Хаб ${currentHub}, Район по умолчанию: ${currentDistrict}.

История общения:
${conversationText}

ПРАВИЛА ИЗВЛЕЧЕНИЯ:
1. TITLE: Выдели СУТЬ предмета/услуги до 40 символов с правильным префиксом:
   - Прокат транспорта -> "СНИМУ В АРЕНДУ: [Название/Модель]" (например: "СНИМУ В АРЕНДУ: Скутер NMAX 155cc")
   - Аренда жилья -> "СНИМУ: [Тип жилья]" (например: "СНИМУ: Виллу 2BR с бассейном")
   - Обмен денег -> "ОБМЕНЯЮ: [Сумма и валюта]" (например: "ОБМЕНЯЮ: 500 USDT на баты")
   - Заказ услуг -> "ЗАКАЖУ: [Название услуги]" (например: "ЗАКАЖУ: Выездной массаж на виллу")
   - Покупка товаров -> "КУПЛЮ: [Товар]" (например: "КУПЛЮ: Шлем Shoei XL")
   - Общий поиск -> "ИЩУ: [Суть поиска]"

2. CATEGORY (Выбери СТРОГО 1 из следующих категорий):
   "ПРОКАТ" | "ЖИЛЬЁ" | "ДЕНЬГИ" | "УСЛУГИ" | "ЕДА" | "КЛИНИНГ" | "КРАСОТА" | "ДЕТИ" | "ТУРЫ" | "ВРАЧИ" | "ПРАКТИКИ" | "ТОВАРЫ" | "ДРУГОЕ"

3. BUDGET: Извлеки чистую цифру бюджета (например, если написано "$15 в день" или "1500 бат", верни число 15 или 1500). Если бюджет не назван, верни 0.

4. DISTRICT: Если пользователь упомянул район в речи (например, "в Раваи", "на Патонге", "в Чангу"), определи его (например "Rawai", "Patong", "Canggu"). Если не упомянул, используй текущий GPS район: "${currentDistrict}".

5. DESCRIPTION: 1-2 четких предложения с деталями БЕЗ приветствий и мусора.

Верни СТРОГО только JSON:
Для уточнения:
{
  "status": "clarify",
  "question": "На какой срок вам нужен байк и в каком районе?"
}

Для завершения:
{
  "status": "complete",
  "requestParams": {
    "title": "СНИМУ В АРЕНДУ: Скутер NMAX 155cc",
    "categoryName": "ПРОКАТ",
    "budget": 15,
    "description": "Нужен скутер NMAX на 7 дней. Доставка в отель.",
    "district": "${currentDistrict}",
    "hub": "${currentHub}"
  }
}
`

  if (genAI && apiKey) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      for (const modelName of fallbackModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName })
          const result = await model.generateContent(prompt)
          const text = result.response.text()
          const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
          const parsed = JSON.parse(jsonStr)

          if (parsed && (parsed.status === 'clarify' || parsed.status === 'complete')) {
            return parsed as SmartAIResponse
          }
        } catch (error: any) {
          console.warn(`Gemini API Warning (${modelName}, Attempt ${attempt}):`, error)
          
          const isModelDeprecated = error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('not found')
          if (isModelDeprecated) {
            continue
          }

          const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Quota')
          if (attempt < maxRetries && (isRateLimit || error?.message?.includes('503') || error?.message?.includes('fetch failed'))) {
            await delay(500)
            break
          }
        }
      }
    }
  }

  // Fallback: Smart deterministic parser (if Gemini API key missing or network fails)
  return parseDeterministicRequest(conversation, currentHub, currentDistrict)
}

export function parseDeterministicRequest(
  conversation: { role: 'user' | 'model', text: string }[],
  currentHub: string,
  currentDistrict: string
): SmartAIResponse {
  const userMsgs = conversation.filter(c => c.role === 'user').map(c => c.text).join(' ')
  const rawUserText = userMsgs.trim() || 'Запрос на услугу'
  const cleanedText = cleanUserText(rawUserText)
  const lowerText = rawUserText.toLowerCase()

  // Extract budget safely
  let extractedBudget = 0
  const budgetMatch = lowerText.match(/(?:бюджет|цена|за|\$)?\s*(\d+[\d\s]*)(?:\s*(?:бат|thb|\$|usd|руб|rub|\/сут|\/день))?/i) || lowerText.match(/(\d{1,6})\s*(?:бат|thb|\$|usd|руб)/i)
  if (budgetMatch && budgetMatch[1]) {
    const parsedNum = parseInt(budgetMatch[1].replace(/\s+/g, ''), 10)
    if (!isNaN(parsedNum) && parsedNum > 0) {
      extractedBudget = parsedNum
    }
  }

  // Detect district in text
  let detectedDistrict = currentDistrict
  if (/равай|rawai/i.test(lowerText)) detectedDistrict = 'Rawai'
  else if (/патонг|patong/i.test(lowerText)) detectedDistrict = 'Patong'
  else if (/чалонг|chalong/i.test(lowerText)) detectedDistrict = 'Chalong'
  else if (/карон|karon/i.test(lowerText)) detectedDistrict = 'Karon'
  else if (/камала|kamala/i.test(lowerText)) detectedDistrict = 'Kamala'
  else if (/чангу|canggu/i.test(lowerText)) detectedDistrict = 'Canggu'
  else if (/семиньяк|seminyak/i.test(lowerText)) detectedDistrict = 'Seminyak'
  else if (/убуд|ubud/i.test(lowerText)) detectedDistrict = 'Ubud'
  else if (/улувату|uluwatu/i.test(lowerText)) detectedDistrict = 'Uluwatu'

  let titleIntent = ''
  let categoryName = 'УСЛУГИ'

  if (/байк|скутер|мото|nmax|pcx|авто|машин|прокат|аренд/i.test(lowerText)) {
    titleIntent = `СНИМУ В АРЕНДУ: ${cleanedText}`
    categoryName = 'ПРОКАТ'
  } else if (/дом|вилл|кондо|апарт|отел|жиль|сним/i.test(lowerText)) {
    titleIntent = `СНИМУ: ${cleanedText}`
    categoryName = 'ЖИЛЬЁ'
  } else if (/нян|сидел|беби|ребен/i.test(lowerText)) {
    titleIntent = `ИЩУ няню: ${cleanedText}`
    categoryName = 'ДЕТИ'
  } else if (/usdt|обмен|крипт|налич|менять|рубли/i.test(lowerText) && !/байк|скутер|авто|дом|вилл/i.test(lowerText)) {
    titleIntent = `ОБМЕНЯЮ: ${cleanedText}`
    categoryName = 'ДЕНЬГИ'
  } else if (/купл|купит|покупк/i.test(lowerText)) {
    titleIntent = `КУПЛЮ: ${cleanedText}`
    categoryName = 'ТОВАРЫ'
  } else if (/клининг|уборк/i.test(lowerText)) {
    titleIntent = `ЗАКАЖУ: ${cleanedText}`
    categoryName = 'КЛИНИНГ'
  } else if (/массаж|макияж|ногти|спа|стриж/i.test(lowerText)) {
    titleIntent = `ЗАКАЖУ: ${cleanedText}`
    categoryName = 'КРАСОТА'
  } else if (/тур|экскурс|яхт|серф/i.test(lowerText)) {
    titleIntent = `ЗАКАЖУ: ${cleanedText}`
    categoryName = 'ТУРЫ'
  } else if (/врач|доктор|капельниц|анализ/i.test(lowerText)) {
    titleIntent = `ВЫЗОВУ: ${cleanedText}`
    categoryName = 'ВРАЧИ'
  } else if (/йог|таро|бачат|медитац/i.test(lowerText)) {
    titleIntent = `ИЩУ: ${cleanedText}`
    categoryName = 'ПРАКТИКИ'
  } else if (/виз|юрист|ремонт|мастер/i.test(lowerText)) {
    titleIntent = `ЗАКАЖУ: ${cleanedText}`
    categoryName = 'УСЛУГИ'
  } else {
    titleIntent = `ИЩУ: ${cleanedText}`
  }

  if (titleIntent.length > 50) {
    titleIntent = titleIntent.slice(0, 47) + '...'
  }

  return {
    status: 'complete',
    requestParams: {
      title: titleIntent,
      categoryName,
      budget: extractedBudget,
      description: cleanedText,
      district: detectedDistrict,
      hub: currentHub
    }
  }
}
