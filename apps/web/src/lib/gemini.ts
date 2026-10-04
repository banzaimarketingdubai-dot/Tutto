import { GoogleGenerativeAI } from '@google/generative-ai'
import { sendSuperadminErrorAlert } from './telegram'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface ParsedRequest {
  title: string
  categoryName: string
  hub: string
  district: string
  auctionDurationMinutes: number
  description: string
  budget: number | null
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
    .replace(/\b(?:привет|приветик|здравствуйте|добрый\s+день|добрый\s+вечер|слушай|слушайте|короче|в\s+общем|типа|пожалуйста|подскажи|поскажи|мне\s+бы|хотел\s+бы|хочу|нужно|нужен|нужна|требуется|ребят|ребята|всем)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^[,\.\!\?\:\-\s]+/, '')
    .trim()

  if (!cleaned) cleaned = rawText.trim()
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

export function extractCoreSubject(rawText: string): string {
  let subject = rawText
    .replace(/\b(?:привет|приветик|здравствуйте|добрый\s+день|добрый\s+вечер|слушай|слушайте|короче|в\s+общем|типа|пожалуйста|подскажи|поскажи|мне\s+бы|хотел\s+бы|хочу|нужно|нужен|нужна|требуется|ищу|закажу|сниму|сниму\s+в\s+аренду|аренда|аренду|снять|куплю|купить|покупка|обменяю|обмен|вызову|ребят|ребята|всем)\b/gi, '')
    .replace(/\b(?:на|в|по|в районе|в хабе|на острове|равай|патонг|чалонг|карон|камала|банг\s*тао|чангу|семиньяк|убуд|пхукет|бали|дубай|панган|самуи|бангкок)\b/gi, '')
    .replace(/\b(?:\d+\s*(?:долларов|usd|\$|бат|thb|рублей|rub|дня|дней|суток|месяц|месяцев))\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^[,\.\!\?\:\-\s]+/, '')
    .replace(/[,\.\!\?\:\-\s]+$/, '')
    .trim()

  if (!subject || subject.length < 3) {
    subject = cleanUserText(rawText)
  }
  return subject.charAt(0).toUpperCase() + subject.slice(1)
}

export async function analyzeRequestFlowWithAI(
  conversation: { role: 'user' | 'model', text: string }[],
  currentHub: string,
  currentDistrict: string,
  maxRetries = 2
): Promise<SmartAIResponse> {
  // STRICT RULE: Only use Gemini 3.5 and higher models (no models below 3.5)
  const fallbackModels = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.5-pro']

  const conversationText = conversation.map(c => `${c.role === 'user' ? 'Пользователь' : 'ИИ'}: ${c.text}`).join('\n')

  const prompt = `
Ты - главный ИИ-ассистент сервиса TuttoMinutto (обратный аукцион услуг и маркетплейс в курортных хабах).
Твоя задача - извлечь из разговорной речи пользователя параметры запроса, ПОЛНОСТЬЮ УБРАТЬ РАЗГОВОРНЫЙ МУСОР И ВВОДНЫЕ СЛОВА ("привет", "слушай", "короче", "в общем", "типа", "мне бы", "хотел узнать", "напиши") и составить КРАТКУЮ, ЧЕТКУЮ профессиональную карточку запроса в виде JSON блока.

Профиль / GPS пользователя по умолчанию:
- Хаб (Гео): "${currentHub}"
- Район (Локация): "${currentDistrict}"

История общения:
${conversationText}

ПРАВИЛА ИЗВЛЕЧЕНИЯ JSON БЛОКА:
1. "categoryName" (Ниша): Выбери СТРОГО 1 из следующих категорий:
   "ПРОКАТ" | "ЖИЛЬЁ" | "ДЕНЬГИ" | "УСЛУГИ" | "ЕДА" | "КЛИНИНГ" | "КРАСОТА" | "ДЕТИ" | "ТУРЫ" | "ВРАЧИ" | "ПРАКТИКИ" | "ТОВАРЫ" | "ДРУГОЕ"

2. "hub" (Гео): Если пользователь упомянул локацию/остров/город (Пхукет -> phuket, Бали -> bali, Дубай -> dubai, Панган -> phangan), напиши ее slug.
   ЕСЛИ пользователь НЕ УКАЗАЛ Гео в промпте — обязательно используй профиль пользователя: "${currentHub}".

3. "district" (Локация): Если пользователь упомянул район в речи (например, "в Раваи", "на Патонге", "в Чангу"), определи его ("Rawai", "Patong", "Canggu", "Chalong", "Ubud").
   ЕСЛИ пользователь НЕ УКАЗАЛ район в промпте — обязательно используй профиль пользователя: "${currentDistrict}".

4. "auctionDurationMinutes" (Время аукциона в минутах): 
   Извлеки желаемое время сбора откликов в минутах (допустимо: 30, 60, 120, 360, 1440).
   Если пользователь не указал конкретное время аукциона, установи значение по умолчанию: 60.

5. "budget" (Цена): 
   Извлеки чистую цифру бюджета (в USD или local currency, например 1500 или 25). 
   ВНИМАНИЕ: Если пользователь не назвал цену или сказано "любая", "по договоренности", "без разницы", верни null.

6. "title" (Заголовок): Выдели СУТЬ предмета/услуги до 40 символов с правильным префиксом:
   - Прокат транспорта -> "СНИМУ В АРЕНДУ: [Название]"
   - Аренда жилья -> "СНИМУ: [Тип жилья]"
   - Обмен денег -> "ОБМЕНЯЮ: [Сумма и валюта]"
   - Заказ услуг -> "ЗАКАЖУ: [Название услуги]"
   - Покупка товаров -> "КУПЛЮ: [Товар]"
   - Общий поиск -> "ИЩУ: [Суть]"

7. "description" (Описание): 1-2 четких предложения с деталями БЕЗ приветствий и мусора.

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
    "hub": "${currentHub}",
    "district": "${currentDistrict}",
    "auctionDurationMinutes": 60,
    "description": "Нужен скутер NMAX на 7 дней. Доставка в отель.",
    "budget": 15
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
            if (parsed.status === 'complete' && parsed.requestParams) {
              parsed.requestParams.hub = parsed.requestParams.hub || currentHub
              parsed.requestParams.district = parsed.requestParams.district || currentDistrict
              parsed.requestParams.auctionDurationMinutes = parsed.requestParams.auctionDurationMinutes || 60
              if (parsed.requestParams.budget === undefined) parsed.requestParams.budget = null
            }
            return parsed as SmartAIResponse
          }
        } catch (error: any) {
          console.warn(`Gemini API Warning (${modelName}, Attempt ${attempt}):`, error?.message || error)
          continue
        }
      }
      if (attempt < maxRetries) {
        await delay(350)
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

  // Extract budget safely or return null for "Любая"
  let extractedBudget: number | null = null
  if (!/любая|любой|по договоренности|договоренности|без разницы|не важно/i.test(lowerText)) {
    const budgetMatch = lowerText.match(/(?:бюджет|цена|за|\$)?\s*(\d+[\d\s]*)(?:\s*(?:бат|thb|\$|usd|руб|rub|\/сут|\/день))?/i) || lowerText.match(/(\d{1,6})\s*(?:бат|thb|\$|usd|руб)/i)
    if (budgetMatch && budgetMatch[1]) {
      const parsedNum = parseInt(budgetMatch[1].replace(/\s+/g, ''), 10)
      if (!isNaN(parsedNum) && parsedNum > 0) {
        extractedBudget = parsedNum
      }
    }
  }

  // Detect district in text or fallback to user profile/GPS
  let detectedDistrict = currentDistrict
  if (/равай|rawai/i.test(lowerText)) detectedDistrict = 'Rawai'
  else if (/патонг|patong/i.test(lowerText)) detectedDistrict = 'Patong'
  else if (/чалонг|chalong/i.test(lowerText)) detectedDistrict = 'Chalong'
  else if (/карон|karon/i.test(lowerText)) detectedDistrict = 'Karon'
  else if (/камала|kamala/i.test(lowerText)) detectedDistrict = 'Kamala'
  else if (/банг\s*тао|bang\s*tao/i.test(lowerText)) detectedDistrict = 'Bang Tao'
  else if (/чангу|canggu/i.test(lowerText)) detectedDistrict = 'Canggu'
  else if (/семиньяк|seminyak/i.test(lowerText)) detectedDistrict = 'Seminyak'
  else if (/убуд|ubud/i.test(lowerText)) detectedDistrict = 'Ubud'
  else if (/улувату|uluwatu/i.test(lowerText)) detectedDistrict = 'Uluwatu'

  // Detect hub in text or fallback to user profile/GPS
  let detectedHub = currentHub
  if (/пхукет|phuket/i.test(lowerText)) detectedHub = 'phuket'
  else if (/бали|bali/i.test(lowerText)) detectedHub = 'bali'
  else if (/дубай|дубаи|dubai/i.test(lowerText)) detectedHub = 'dubai'
  else if (/панган|phangan/i.test(lowerText)) detectedHub = 'phangan'
  else if (/самуи|samui/i.test(lowerText)) detectedHub = 'samui'
  else if (/бангкок|bangkok/i.test(lowerText)) detectedHub = 'bangkok'

  // Detect duration in text or default 60 mins
  let durationMinutes = 60
  if (/30\s*мин|полчаса/i.test(lowerText)) durationMinutes = 30
  else if (/2\s*час|120\s*мин/i.test(lowerText)) durationMinutes = 120
  else if (/6\s*час|360\s*мин/i.test(lowerText)) durationMinutes = 360
  else if (/суток|сутки|24\s*час|1440\s*мин/i.test(lowerText)) durationMinutes = 1440

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
      hub: detectedHub,
      auctionDurationMinutes: durationMinutes
    }
  }
}
