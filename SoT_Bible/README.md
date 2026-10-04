# 📚 TuttoMinutto — «Библия Проекта» (Source of Truth)

> **Версия:** 1.4  
> **Дата:** 2026-09-25  
> **Статус:** Готово к разработке  
> **Стек:** React TMA + Supabase + FastAPI + GrammyJS  
> **Официальный бренд:** `TuttoMinutto` · `@tuttominutto` · `tuttominutto.app`

---

## Что это такое

**TuttoMinutto** — платформа локального обратного аукциона для курортных хабов ЮВА (Пхукет, Бали, Бангкок, Нячанг). Клиент создаёт заявку → исполнители конкурируют ценой → AI-менеджеры отвечают за 5 секунд.

> *Tutto* (ит.) = всё · *Minutto* (ит.) = минута → **«Всё за одну минуту»**

Этот репозиторий документов является единственным источником истины (Source of Truth) для всей команды разработки.

---

## 📁 Содержание Библии

| Файл | Содержание |
|---|---|
| [00_BRANDING.md](./00_BRANDING.md) | **Брендинг:** название, логотип, цвета, типографика, дизайн-токены, матрица написания |
| [01_SYSTEM_OVERVIEW.md](./01_SYSTEM_OVERVIEW.md) | Назначение, архитектура, стек, хабы, KPI |
| [02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md) | Полный SQL-скрипт БД: таблицы, RLS, индексы, ERD |
| [03_SERVICE_TAXONOMY.md](./03_SERVICE_TAXONOMY.md) | Рубрикатор услуг (7 L1 → 26 L2 → 55+ L3) + Seed SQL |
| [04_USER_JOURNEYS_AND_FLOWS.md](./04_USER_JOURNEYS_AND_FLOWS.md) | Флоу клиента, исполнителя, AI, партнёра, онбординга |
| [05_UI_UX_SCREEN_SPEC.md](./05_UI_UX_SCREEN_SPEC.md) | Дизайн-токены, спецификация 6 экранов, анимации |
| [06_AI_SALES_AGENT_SPEC.md](./06_AI_SALES_AGENT_SPEC.md) | FastAPI AI Worker, System Prompt, Auto-Bidder код |
| [07_API_AND_REALTIME_SPEC.md](./07_API_AND_REALTIME_SPEC.md) | Supabase Auth, WebSockets, REST endpoints, Edge Functions |
| [08_PARTNER_PROGRAM.md](./08_PARTNER_PROGRAM.md) | Партнёрская программа 20%, уровни, антифрод, выплаты |
| [09_ROADMAP_AND_EXECUTION.md](./09_ROADMAP_AND_EXECUTION.md) | 4-недельный план, задачи, deliverables, деплой |
| [10_ONBOARDING_AND_BUSINESS_CARD.md](./10_ONBOARDING_AND_BUSINESS_CARD.md) | Онбординг клиента и партнёра, AI-опрос, шаблоны бизнес-карточек по нишам |
| [11_REVIEWS_AND_AUCTION_TIMING.md](./11_REVIEWS_AND_AUCTION_TIMING.md) | Система отзывов (антифрод, AI-модерация, ответы) + тайминги аукциона по нишам, кнопка-батарейка |
| [12_USER_INTERFACE_COMPLETE.md](./12_USER_INTERFACE_COMPLETE.md) | Полная спецификация 15 экранов пользователя + система геолокации (7 типов) + Избранное |
| [13_BUSINESS_INTERFACE.md](./13_BUSINESS_INTERFACE.md) | Полная спецификация 12 экранов B2B: дашборд, AI-агент, кошелёк, оплата, Premium, аналитика |
| [14_ADMIN_PANEL.md](./14_ADMIN_PANEL.md) | Админ-панель: дашборд, верификация, модерация, чаты, апелляции, транзакции, рассылки |
| [15_TOKEN_AND_PREMIUM.md](./15_TOKEN_AND_PREMIUM.md) | Токеномика: пакеты, цены, DB-триггеры + Verified Partner: галочка, приоритет, $19/мес |
| [16_NOTIFICATIONS_MATRIX.md](./16_NOTIFICATIONS_MATRIX.md) | Полная матрица уведомлений: 28 событий, шаблоны RU/EN, GrammyJS код |
| [17_DEAL_FLOW_AND_CHAT.md](./17_DEAL_FLOW_AND_CHAT.md) | Флоу сделки, медиа-чат (6 типов), поддержка + тикеты, апелляции |
| [18_CLARIFICATION_FLOW.md](./18_CLARIFICATION_FLOW.md) | Флоу уточнения деталей заказа |
| [18_LEGAL_AND_RULES.md](./18_LEGAL_AND_RULES.md) | Правовая база, правила платформы |
| [19_ARCHITECTURE_AND_PLATFORMS.md](./19_ARCHITECTURE_AND_PLATFORMS.md) | Архитектура, платформенные решения |
| [19_MAP_LOCATION_PICKER.md](./19_MAP_LOCATION_PICKER.md) | Пикер геолокации на карте |
| [20_FLASH_MARKET_SPEC.md](./20_FLASH_MARKET_SPEC.md) | **🔥 Flash Market:** C2C/B2C маркетплейс, аукционы товаров, Buy Now, рубрикатор товаров, DB-схема, уведомления, CRON |
| [21_DYNAMIC_BOTTOM_NAV_AND_MARKET_ADMIN.md](./21_DYNAMIC_BOTTOM_NAV_AND_MARKET_ADMIN.md) | **🔥 Динамическое меню + Админ маркета:** контекстная навигация, экран «Моё», поиск товаров, статистика маркета, модерация, аналитика аукционов |

---

## 🚀 Быстрый старт для разработчика

### 1. Развернуть базу данных
```bash
# 1. Зайди в Supabase Dashboard → SQL Editor
# 2. Выполни скрипт из 02_DATABASE_SCHEMA.md
# 3. Выполни seed из 03_SERVICE_TAXONOMY.md
```

### 2. Запустить Frontend (TMA)
```bash
cd frontend
npm install
cp .env.example .env  # заполни SUPABASE_URL, SUPABASE_ANON_KEY, BOT_TOKEN
npm run dev
```

### 3. Запустить AI Worker
```bash
cd ai_worker
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # заполни OPENAI_API_KEY, SUPABASE keys
uvicorn main:app --reload --port 8000
```

### 4. Запустить Telegram Bot
```bash
cd telegram_bot
npm install
cp .env.example .env  # заполни BOT_TOKEN, SUPABASE keys
npm run dev
```

---

## 🎨 Дизайн-система (быстрая шпаргалка)

| Токен | Значение | Роль |
|---|---|---|
| `--bg-primary` | `#0D1117` | Фон приложения |
| `--bg-card` | `#161B22` | Карточки |
| `--bg-surface` | `#21262D` | Поля ввода |
| `--cyan` | `#00F2FE` | **TUTTO** · кнопки · активные эл-ты |
| `--green` | `#00FF87` | **MINUTTO** · успех · балансы |
| `--gradient-brand` | `135deg, #00F2FE→#00FF87` | Основной градиент |
| `--danger` | `#FF2A6D` | Ошибки · апелляции |
| `--warning` | `#FFB302` | Таймеры · ожидание |
| `--text-primary` | `#FFFFFF` | Основной текст |
| `--text-secondary` | `#8B949E` | Второстепенный текст |

> Полная дизайн-система: [00_BRANDING.md](./00_BRANDING.md)

---

## 💡 Ключевые бизнес-правила

1. **Обратный аукцион:** исполнители конкурируют ценой, клиент выбирает лучшее предложение.
2. **AI за 5 секунд:** при новом заказе FastAPI Worker запускает AI-отклики в фоне.
3. **Партнёрка 20%:** автоматически начисляется при каждом платеже реферала (Lifetime).
4. **Двуязычность:** все UI строки должны быть в i18n (`ru` / `en`).
5. **Авторизация только через Telegram:** никаких форм email/password.
6. **RLS строго:** пользователь видит только свои данные (bids, earnings, payouts).
7. **Модели Gemini >= 3.5:** в фолбек-цепочке Gemini API разрешено использовать СТРОГО версии 3.5 и выше (`gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.5-flash`, `gemini-3.5-pro`).

---

## 📞 Хабы и районы (справочник)

| Хаб | Код | Популярные районы |
|---|---|---|
| Пхукет | `phuket` | Патонг, Раваи, Чалонг, Карон, Камала, Сурин |
| Бали | `bali` | Семиньяк, Чангу, Убуд, Нуса-Дуа, Кута |
| Бангкок | `bangkok` | Экхамай, Асок, Силом, Лумпини, Рачада |
| Нячанг | `vietnam` | Нячанг, Дананг, Хойан, Хошимин |


> **Версия:** 1.3  
> **Дата:** 2026-09-25  
> **Статус:** Готово к разработке  
> **Стек:** React TMA + Supabase + FastAPI + GrammyJS

---

## Что это такое

**NeedTnow** — платформа локального обратного аукциона для курортных хабов ЮВА (Пхукет, Бали, Бангкок, Нячанг). Клиент создаёт заявку → исполнители конкурируют ценой → AI-менеджеры отвечают за 5 секунд.

Этот репозиторий документов является единственным источником истины (Source of Truth) для всей команды разработки.

---

## 📁 Содержание Библии

| Файл | Содержание |
|---|---|
| [01_SYSTEM_OVERVIEW.md](./01_SYSTEM_OVERVIEW.md) | Назначение, архитектура, стек, хабы, KPI |
| [02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md) | Полный SQL-скрипт БД: таблицы, RLS, индексы, ERD |
| [03_SERVICE_TAXONOMY.md](./03_SERVICE_TAXONOMY.md) | Рубрикатор услуг (7 L1 → 26 L2 → 55+ L3) + Seed SQL |
| [04_USER_JOURNEYS_AND_FLOWS.md](./04_USER_JOURNEYS_AND_FLOWS.md) | Флоу клиента, исполнителя, AI, партнёра, онбординга |
| [05_UI_UX_SCREEN_SPEC.md](./05_UI_UX_SCREEN_SPEC.md) | Дизайн-токены, спецификация 6 экранов, анимации |
| [06_AI_SALES_AGENT_SPEC.md](./06_AI_SALES_AGENT_SPEC.md) | FastAPI AI Worker, System Prompt, Auto-Bidder код |
| [07_API_AND_REALTIME_SPEC.md](./07_API_AND_REALTIME_SPEC.md) | Supabase Auth, WebSockets, REST endpoints, Edge Functions |
| [08_PARTNER_PROGRAM.md](./08_PARTNER_PROGRAM.md) | Партнёрская программа 20%, уровни, антифрод, выплаты |
| [09_ROADMAP_AND_EXECUTION.md](./09_ROADMAP_AND_EXECUTION.md) | 4-недельный план, задачи, deliverables, деплой |
| [10_ONBOARDING_AND_BUSINESS_CARD.md](./10_ONBOARDING_AND_BUSINESS_CARD.md) | Онбординг клиента и партнёра, AI-опрос, шаблоны бизнес-карточек по нишам |
| [11_REVIEWS_AND_AUCTION_TIMING.md](./11_REVIEWS_AND_AUCTION_TIMING.md) | Система отзывов (антифрод, AI-модерация, ответы) + тайминги аукциона по нишам, кнопка-батарейка |
| [12_USER_INTERFACE_COMPLETE.md](./12_USER_INTERFACE_COMPLETE.md) | Полная спецификация 14 экранов пользователя: лента, аукцион, создание заказа, профиль, поиск, отзыв |
| [13_BUSINESS_INTERFACE.md](./13_BUSINESS_INTERFACE.md) | Полная спецификация 12 экранов B2B: дашборд, AI-агент, кошелёк, оплата, Premium, аналитика |
| [14_ADMIN_PANEL.md](./14_ADMIN_PANEL.md) | Админ-панель: дашборд, верификация, модерация, чаты, апелляции, транзакции, рассылки |
| [15_TOKEN_AND_PREMIUM.md](./15_TOKEN_AND_PREMIUM.md) | Токеномика: пакеты, цены, DB-триггеры + Verified Partner: галочка, приоритет, $19/мес |
| [16_NOTIFICATIONS_MATRIX.md](./16_NOTIFICATIONS_MATRIX.md) | Полная матрица уведомлений: 28 событий, шаблоны RU/EN, GrammyJS код |
| [17_DEAL_FLOW_AND_CHAT.md](./17_DEAL_FLOW_AND_CHAT.md) | Флоу сделки, внутренний чат, система апелляций, доступ админа к истории чатов |

---

## 🚀 Быстрый старт для разработчика

### 1. Развернуть базу данных
```bash
# 1. Зайди в Supabase Dashboard → SQL Editor
# 2. Выполни скрипт из 02_DATABASE_SCHEMA.md
# 3. Выполни seed из 03_SERVICE_TAXONOMY.md
```

### 2. Запустить Frontend (TMA)
```bash
cd frontend
npm install
cp .env.example .env  # заполни SUPABASE_URL, SUPABASE_ANON_KEY, BOT_TOKEN
npm run dev
```

### 3. Запустить AI Worker
```bash
cd ai_worker
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # заполни OPENAI_API_KEY, SUPABASE keys
uvicorn main:app --reload --port 8000
```

### 4. Запустить Telegram Bot
```bash
cd telegram_bot
npm install
cp .env.example .env  # заполни BOT_TOKEN, SUPABASE keys
npm run dev
```

---

## 🎨 Дизайн-система (быстрая шпаргалка)

| Токен | Значение |
|---|---|
| `bg-primary` | `#0D1117` |
| `bg-card` | `#21262D` |
| `accent-cyan` | `#00F2FE` |
| `accent-green` | `#00FF87` |
| `gradient-main` | `linear-gradient(135deg, #00F2FE, #00FF87)` |
| `text-primary` | `#FFFFFF` |
| `text-secondary` | `#8B949E` |
| `status-danger` | `#FF2A6D` |

---

## 💡 Ключевые бизнес-правила

1. **Обратный аукцион:** исполнители конкурируют ценой, клиент выбирает лучшее предложение.
2. **AI за 5 секунд:** при новом заказе FastAPI Worker запускает AI-отклики в фоне.
3. **Партнёрка 20%:** автоматически начисляется при каждом платеже реферала (Lifetime).
4. **Двуязычность:** все UI строки должны быть в i18n (`ru` / `en`).
5. **Авторизация только через Telegram:** никаких форм email/password.
6. **RLS строго:** пользователь видит только свои данные (bids, earnings, payouts).

---

## 📞 Хабы и районы (справочник)

| Хаб | Код | Популярные районы |
|---|---|---|
| Пхукет | `phuket` | Патонг, Раваи, Чалонг, Карон, Камала, Сурин |
| Бали | `bali` | Семиньяк, Чангу, Убуд, Нуса-Дуа, Кута |
| Бангкок | `bangkok` | Экхамай, Асок, Силом, Лумпини, Рачада |
| Нячанг | `vietnam` | Нячанг, Дананг, Хойан, Хошимин |
