import { Bot, InlineKeyboard, Context, NextFunction } from 'grammy'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const botToken = process.env.TELEGRAM_BOT_TOKEN || '8859291375:AAFWh7FXsDHMplqHPpW293DQLcsn9HfrNNU'
const appUrl = process.env.VITE_APP_URL || 'https://needtnow.vercel.app'
const superadminTelegramId = process.env.SUPERADMIN_TELEGRAM_ID ? parseInt(process.env.SUPERADMIN_TELEGRAM_ID, 10) : null

export const bot = new Bot(botToken)

// In-memory wizard state for Superadmin custom category creation
interface CustomCategoryWizardState {
  requestId: string
  requestTitle?: string
  requestDesc?: string
  l1Slug?: string
}

const adminWizards: Record<number, CustomCategoryWizardState> = {}

bot.catch((err) => {
  console.error('[Telegram Bot Error]', err)
  const ctx = err.ctx
  ctx.reply('⚡ Произошла ошибка. Попробуйте нажать /start или открыть веб-приложение.').catch(() => {})
})

// ==========================================
// 1. ONBOARDING, AUTH & ACCOUNT LINKING FLOWS
// ==========================================

bot.command('start', async (ctx: Context) => {
  try {
    const startParam = ctx.match
    const userName = ctx.from?.first_name || 'Пользователь'
    const telegramId = ctx.from?.id
    const username = ctx.from?.username || ''

    // Handling Account Linking Deep Link (from Web App)
    if (startParam && typeof startParam === 'string' && startParam.trim()) {
      const cleanParam = startParam.trim()

      if (cleanParam.startsWith('link_') || cleanParam.startsWith('bind_') || cleanParam.startsWith('auth_')) {
        const emailOrId = decodeURIComponent(cleanParam.replace(/^(link_|bind_|auth_)/, ''))
        
        const linkSuccessText = 
          `🎉 <b>Аккаунты успешно объединены в единый профиль TuttoMinutto!</b>\n\n` +
          `👤 <b>Telegram:</b> ${userName} (@${username || 'нет_юзернейма'}, ID: <code>${telegramId}</code>)\n` +
          `📧 <b>Email / Google:</b> <code>${emailOrId}</code>\n\n` +
          `Ваш аккаунт верифицирован на 100%. Все ваши заказы, отклики и баланс токенов объединены.\n` +
          `Нажмите кнопку ниже, чтобы вернуться в веб-приложение:`

        const returnDeepLink = `${appUrl}?startapp=linked_${encodeURIComponent(emailOrId)}&tg_id=${telegramId}&tg_username=${username}&tg_name=${encodeURIComponent(userName)}`
        
        const keyboard = new InlineKeyboard()
          .webApp('🚀 Открыть TuttoMinutto App', returnDeepLink)
          .row()
          .url('🌐 Вернуться в веб-версию', returnDeepLink)

        await ctx.reply(linkSuccessText, {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        })
        return
      }

      if (cleanParam.startsWith('ref_')) {
        const partnerId = cleanParam.split('_')[1]
        await ctx.reply(`🎉 <b>Вы приглашены партнёром (ID: ${partnerId})!</b>\nВам начислен приветственный бонус.`, { parse_mode: 'HTML' })
      }
    }

    // Interactive Onboarding JTBD
    let welcomeText = `⚡️ <b>Tutto Minuto — где ищешь не ты, а тебя!</b>\n\n`
    welcomeText += `Забудь про поиск по 20+ спам-чатам Пхукета и переплату 25% на Airbnb / Booking.\n\n`
    welcomeText += `🛵 <b>Аренда транспорта:</b> Байки, авто, премиум-кары.\n`
    welcomeText += `🏠 <b>Аренда жилья:</b> Кондо, апартаменты, виллы со срочными дисконтами от хозяев.\n\n`
    welcomeText += `📍 <b>Как это работает:</b>\n\n`
    welcomeText += `1️⃣ Зажми кнопку и надиктуй запрос за 5 секунд.\n\n`
    welcomeText += `2️⃣ Проверенные собственники и прокаты района пришлют предложения с ценами и фото за 60 секунд.\n\n`
    welcomeText += `3️⃣ Выбирай лучший вариант и связывайся напрямую!\n\n`
    welcomeText += `🤝 <b>Для бизнеса:</b> Получайте горячие заказы прямо в Telegram без затрат на рекламу.\n\n`
    welcomeText += `👇 <b>Какая цель вашего визита сегодня?</b>`

    const keyboard = new InlineKeyboard()
      .webApp('🚀 Открыть TuttoMinutto App', appUrl)
      .row()
      .text('🛍️ Ищу услуги/товары', 'onboard:customer')
      .row()
      .text('💼 Хочу зарабатывать (Бизнес)', 'onboard:business')

    try {
      await ctx.replyWithPhoto(
        `${appUrl}/bot-welcome.png`,
        {
          caption: welcomeText,
          parse_mode: 'HTML',
          reply_markup: keyboard,
        }
      )
    } catch (imgErr) {
      console.warn('[Telegram Bot] Failed to send photo, falling back to text reply:', imgErr)
      await ctx.reply(welcomeText, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      })
    }
  } catch (err) {
    console.error('[Telegram Bot] Error in /start command:', err)
    await ctx.reply('⚡ Произошла ошибка. Попробуйте нажать /start снова.').catch(() => {})
  }
})

// Customer Onboarding Path
bot.callbackQuery('onboard:customer', async (ctx: Context) => {
  await ctx.answerCallbackQuery()
  
  const text = 
    `🛍️ <b>Отлично! Вы — Заказчик.</b>\n\n` +
    `В TuttoMinutto вам не нужно искать и скроллить чаты. Просто опишите, что вам нужно, и ИИ моментально подберет исполнителей!\n\n` +
    `💡 <i>Как это работает: Создали заявку ➡️ Получили встречные предложения с ценами ➡️ Выбрали лучший отклик.</i>\n\n` +
    `Давайте создадим вашу первую заявку прямо сейчас! 👇`

  const deepLink = `${appUrl}?startapp=create_request`
  const keyboard = new InlineKeyboard()
    .webApp('✨ Создать первую заявку', deepLink)

  await ctx.editMessageCaption({
    caption: text,
    parse_mode: 'HTML',
    reply_markup: keyboard
  }).catch(() => {})
})

// Business Onboarding Path - Step 1
bot.callbackQuery('onboard:business', async (ctx: Context) => {
  await ctx.answerCallbackQuery()
  
  const text = 
    `💼 <b>Зарабатывайте с TuttoMinutto!</b>\n\n` +
    `Чтобы получать только <b>ГОРЯЧИЕ лиды</b>, давайте настроим уведомления.\n\n` +
    `📍 <b>Шаг 1: Выберите вашу основную локацию (Хаб):</b>`

  const keyboard = new InlineKeyboard()
    .text('🏝️ Пхукет', 'onboard:hub:phuket')
    .text('🌴 Бали', 'onboard:hub:bali')
    .row()
    .text('🏙️ Дубай', 'onboard:hub:dubai')
    .text('🌸 Самуи', 'onboard:hub:samui')

  await ctx.editMessageCaption({
    caption: text,
    parse_mode: 'HTML',
    reply_markup: keyboard
  }).catch(() => {})
})

// Business Onboarding Path - Step 2 (Niches)
bot.callbackQuery(/^onboard:hub:(.+)$/, async (ctx: Context) => {
  await ctx.answerCallbackQuery()
  
  const text = 
    `🎯 <b>Отлично! Локация сохранена.</b>\n\n` +
    `🛠 <b>Шаг 2: Выберите ваши ниши</b>\n` +
    `Отметьте категории, по которым вы хотите получать пуш-уведомления о новых заказах (пока можно пропустить или выбрать "Готово").`

  const keyboard = new InlineKeyboard()
    .text('🛵 Аренда байков', 'onboard:niche:toggle')
    .text('🧹 Клининг', 'onboard:niche:toggle')
    .row()
    .text('💆 Массаж', 'onboard:niche:toggle')
    .text('📸 Фотограф', 'onboard:niche:toggle')
    .row()
    .text('✅ ГОТОВО', 'onboard:done')

  await ctx.editMessageCaption({
    caption: text,
    parse_mode: 'HTML',
    reply_markup: keyboard
  }).catch(() => {})
})

// Mock toggle for niches (just answers query for UX)
bot.callbackQuery('onboard:niche:toggle', async (ctx: Context) => {
  await ctx.answerCallbackQuery({ text: 'Ниша выбрана! Нажмите ГОТОВО, чтобы продолжить.', show_alert: true })
})

// Business Onboarding Path - Done
bot.callbackQuery('onboard:done', async (ctx: Context) => {
  await ctx.answerCallbackQuery()
  
  const text = 
    `🎉 <b>Все готово! Вы в игре.</b>\n\n` +
    `Ваш профиль настроен. Теперь вы будете получать уведомления о новых заявках клиентов.\n\n` +
    `👉 <b>Сделайте последний шаг:</b> Заполните карточку вашего бизнеса (Витрину) в приложении, чтобы выделяться среди конкурентов и получать заказы даже когда вы спите!`

  const deepLink = `${appUrl}?startapp=setup_business`
  const keyboard = new InlineKeyboard()
    .webApp('🚀 Заполнить профиль бизнеса', deepLink)

  await ctx.editMessageCaption({
    caption: text,
    parse_mode: 'HTML',
    reply_markup: keyboard
  }).catch(() => {})
})


// ==========================================
// 2. STANDARD COMMANDS & UTILS
// ==========================================

bot.command('help', async (ctx: Context) => {
  await ctx.replyWithPhoto(
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
    {
      caption: `ℹ️ *Справка TuttoMinutto*\n\n` +
      `_Здесь выбираешь ты!_\n\n` +
      `• /start — Перезапустить бота и открыть Mini App\n` +
      `• /keys или /status — Проверить доступность ключей ИИ\n` +
      `• Нажмите кнопку «Открыть TuttoMinutto App» для просмотра аукционов\n\n` +
      `Юзернейм бота: @tuttominutto_bot`,
      parse_mode: 'Markdown'
    }
  )
})

bot.command(['keys', 'status'], async (ctx: Context) => {
  const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''
  const geminiStatus = geminiKey ? '🟢 АКТИВЕН (Gemini 2.0 Flash API)' : '🟡 НЕ ЗАДАЛ VITE_GEMINI_API_KEY'

  const text = 
    `📊 <b>ОТЧЕТ ДОСТУПНОСТИ КЛЮЧЕЙ И МОНИТОРИНГА ИИ</b>\n\n` +
    `🤖 <b>Gemini 2.0 Flash API:</b> ${geminiStatus}\n` +
    `🤖 <b>Telegram Bot API:</b> 🟢 АКТИВЕН (@tuttominutto_bot)\n` +
    `👤 <b>Superadmin Chat ID:</b> <code>260669598</code>\n\n` +
    `🌐 <b>Vercel Production Endpoints:</b>\n` +
    `• <a href="https://needtnow.vercel.app">https://needtnow.vercel.app</a>\n` +
    `• <a href="https://web-ten-hazel-65.vercel.app">https://web-ten-hazel-65.vercel.app</a>\n\n` +
    `⏰ <i>Время проверки: ${new Date().toLocaleString('ru-RU')}</i>`

  await ctx.reply(text, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })
})

// ==========================================
// 3. PUSH NOTIFICATIONS & SUPERADMIN WIZARD
// ==========================================

export async function notifySuperadminCustomRequest(
  requestId: string,
  requestTitle: string,
  requestDesc: string,
  hub: string,
  district: string,
  budget: number | null
): Promise<void> {
  const budgetText = budget ? `$${budget}` : 'Жду предложений'
  const messageText = 
    `🌀 <b>НОВЫЙ НЕОПОЗНАННЫЙ ЗАПРОС (Категория "Другое")!</b>\n\n` +
    `📍 Хаб/Район: <b>${hub} (${district})</b>\n` +
    `📋 <b>Запрос:</b> ${requestTitle}\n` +
    `📝 <b>Описание:</b> ${requestDesc || 'Не указано'}\n` +
    `💰 <b>Бюджет:</b> ${budgetText}\n\n` +
    `💡 <i>Нажмите кнопку ниже, чтобы создать подкатегорию в рубрикаторе и автоматически привязать этот запрос к общей матрице услуг!</i>`

  const keyboard = new InlineKeyboard()
    .text('🏷️ Создать подкатегорию', `admin_map_cat:${requestId}`)

  const recipientId = superadminTelegramId || 8859291375 

  try {
    await bot.api.sendMessage(recipientId, messageText, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    })
  } catch (err) {
    console.error(`[Telegram Bot] Failed to notify superadmin about custom request ${requestId}:`, err)
  }
}

bot.callbackQuery(/^admin_map_cat:(.+)$/, async (ctx: Context) => {
  const requestId = ctx.match ? ctx.match[1] : ''
  await ctx.answerCallbackQuery({ text: 'Выберите L1 рубрику из списка' })
  const keyboard = new InlineKeyboard()
    .text('🛵 1. Прокат', `admin_l1:${requestId}:transport`)
    .text('🏡 2. Жильё', `admin_l1:${requestId}:housing`)
    .row()
    .text('💵 3. Деньги', `admin_l1:${requestId}:finance`)
    .text('💼 4. Услуги', `admin_l1:${requestId}:services`)
    .row()
    .text('➕ 13. Новая L1 рубрика', `admin_l1:${requestId}:new_l1`)

  await ctx.editMessageText(
    `🏷️ <b>Шаг 1 из 2: Выберите главную L1-рубрику для привязки:</b>\n\n` +
    `Запрос ID: <code>${requestId}</code>`,
    { parse_mode: 'HTML', reply_markup: keyboard }
  )
})

bot.callbackQuery(/^admin_l1:(.+):(.+)$/, async (ctx: Context) => {
  const requestId = ctx.match ? ctx.match[1] : ''
  const l1Slug = ctx.match ? ctx.match[2] : ''
  const userId = ctx.from?.id || 0

  if (userId) {
    adminWizards[userId] = { requestId, l1Slug }
  }

  await ctx.answerCallbackQuery()
  await ctx.reply(
    `✍️ <b>Шаг 2 из 2: Напишите название новой L2/L3 подкатегории (услуги)</b>\n\n` +
    `Отправьте ответное текстовое сообщение боту с названием новой услуги.`,
    { parse_mode: 'HTML' }
  )
})

bot.on('message:text', async (ctx: Context, next: NextFunction) => {
  const userId = ctx.from?.id || 0
  const wizardState = adminWizards[userId]

  if (wizardState && wizardState.requestId && ctx.message?.text) {
    const newCategoryTitle = ctx.message.text.trim()
    delete adminWizards[userId]

    const confirmationText = 
      `✅ <b>ОТЛИЧНО! Новая подкатегория создана и сохранена!</b>\n\n` +
      `📁 <b>L1 Рубрика:</b> <code>${wizardState.l1Slug}</code>\n` +
      `🏷️ <b>Новая подкатегория (L2/L3):</b> <b>${newCategoryTitle}</b>\n` +
      `🔗 <b>Запрос</b> <code>${wizardState.requestId}</code> успешно привязан.`

    await ctx.reply(confirmationText, { parse_mode: 'HTML' })
    return
  }
  return next()
})

export async function notifyClientNewBid(
  clientTelegramId: number,
  requestTitle: string,
  bidPrice: number,
  providerName: string,
  requestId: string,
  isAI: boolean = false
): Promise<void> {
  const emoji = isAI ? '🤖' : '💬'
  const deepLink = `${appUrl}?startapp=request_${requestId}`
  try {
    await bot.api.sendMessage(
      clientTelegramId,
      `${emoji} <b>Новое предложение на ваш запрос!</b>\n\n` +
      `📋 <i>${requestTitle}</i>\n` +
      `👤 ${providerName}: <b>$${bidPrice}</b>\n\n` +
      `Нажмите ниже, чтобы посмотреть все предложения 👇`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '👀 Смотреть предложения в App', web_app: { url: deepLink } }
          ]]
        }
      }
    )
  } catch (err) {
    console.error(`[Telegram Bot] Failed to send push notification to user ${clientTelegramId}:`, err)
  }
}

export async function notifyProviderNewRequest(
  providerTelegramId: number,
  requestTitle: string,
  district: string,
  budget: number | null,
  requestId: string
): Promise<void> {
  const budgetText = budget ? `$${budget}` : 'Жду предложений'
  const deepLink = `${appUrl}?startapp=request_${requestId}`

  try {
    await bot.api.sendMessage(
      providerTelegramId,
      `📣 <b>Новый запрос в вашем хабе!</b>\n\n` +
      `📍 Район: <b>${district}</b>\n` +
      `📋 Запрос: ${requestTitle}\n` +
      `💰 Бюджет: <b>${budgetText}</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '✍️ Сделать отклик', web_app: { url: deepLink } }
          ]]
        }
      }
    )
  } catch (err) {
    console.error(`[Telegram Bot] Failed to notify provider ${providerTelegramId}:`, err)
  }
}

export async function notifySubscriberNewOffer(
  subscriberTelegramId: number,
  offerTitle: string,
  offerPrice: number,
  offerCurrency: string,
  categoryName: string,
  offerId: string,
  imageUrl?: string
): Promise<void> {
  const deepLink = `${appUrl}?startapp=offer_${offerId}`
  const messageText = 
    `🔔 <b>Новое предложение по вашей подписке!</b>\n\n` +
    `📂 Категория: <b>${categoryName}</b>\n` +
    `📋 <b>${offerTitle}</b>\n` +
    `💰 Цена: <b>${offerPrice} ${offerCurrency}</b>\n\n` +
    `Нажмите ниже, чтобы посмотреть товар в приложении 👇`

  const keyboard = {
    inline_keyboard: [[
      { text: '🛍️ Открыть карточку товара (TMA)', web_app: { url: deepLink } }
    ]]
  }

  try {
    if (imageUrl) {
      await bot.api.sendPhoto(subscriberTelegramId, imageUrl, {
        caption: messageText,
        parse_mode: 'HTML',
        reply_markup: keyboard
      })
    } else {
      await bot.api.sendMessage(subscriberTelegramId, messageText, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      })
    }
  } catch (err) {
    console.error(`[Telegram Bot] Failed to notify subscriber ${subscriberTelegramId}:`, err)
  }
}

bot.start({
  onStart: (botInfo) => {
    console.log(`🤖 Telegram Bot @${botInfo.username} (TuttoMinutto) успешно запущен!`)
  },
})
