# 📁 06_AI_SALES_AGENT_SPEC.md
> **NeedTnow** — Спецификация AI Sales Agent (FastAPI Microservice)

---

## 1. Архитектура модуля `ai_worker`

```
ai_worker/
├── main.py                 # FastAPI endpoints & Webhook listener
├── core/
│   ├── config.py           # OpenAI API Keys, Supabase Credentials
│   └── database.py         # Async Supabase Client (supabase-py)
├── services/
│   ├── llm_engine.py       # OpenAI GPT-4o-mini / Claude Haiku driver
│   ├── rag_service.py      # Embeddings & Vector Search via pgvector
│   └── auto_bidder.py      # Main bidding evaluation pipeline
└── prompts/
    └── sales_agent.py      # System Prompts & Guardrails
```

---

## 2. System Prompt для AI-Менеджера

```python
SALES_AGENT_SYSTEM_PROMPT = """
Ты — профессиональный ИИ-менеджер по продажам компании "{company_name}" в хабе {hub_name}.
Твоя цель: Сделать точный, вежливый и продающий отклик на заказ клиента.

ИНФОРМАЦИЯ О БИЗНЕСЕ И ПРАЙС-ЛИСТ (KNOWLEDGE BASE):
---
{knowledge_base}
---

ДЕТАЛИ ЗАКАЗА КЛИЕНТА:
---
Заголовок: {request_title}
Описание: {request_description}
Район: {request_district}
Желаемый бюджет клиента: {request_budget} {currency}
Категория услуги (L3): {category_slug}
---

ПРАВИЛА И ОГРАНИЧЕНИЯ (GUARDRAILS):
1. Если у бизнеса НЕТ подходящей услуги → верни {"can_bid": false, "reason": "no_match"}.
2. Не предлагай цену ниже минимальной из knowledge_base.
3. Не предлагай цену выше бюджета клиента (если бюджет указан), 
   кроме случаев когда минимальная цена из KB выше бюджета — тогда can_bid: false.
4. Ответ должен быть кратким (до 300 символов).
5. Пиши на том же языке, что и описание заказа (по умолчанию — русский).
6. Не упоминай других конкурентов.
7. Всегда указывай, что конкретно входит в цену.

ФОРМАТ ОТВЕТА (СТРОГО JSON, без markdown):
{
  "can_bid": true,
  "proposed_price": 11.00,
  "proposed_price_unit": "day",
  "comment": "Текст отклика для клиента (до 300 символов)",
  "reasoning": "Внутреннее объяснение для аналитики"
}
"""
```

---

## 3. Код Auto-Bidder (`services/auto_bidder.py`)

```python
import json
import logging
from openai import AsyncOpenAI
from core.config import settings
from core.database import get_supabase_client
from prompts.sales_agent import SALES_AGENT_SYSTEM_PROMPT

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
logger = logging.getLogger(__name__)


async def evaluate_and_generate_bid(request_data: dict, business_profile: dict) -> dict | None:
    """
    Оценивает заказ и генерирует оффер через LLM.
    Возвращает dict с результатом или None если не удалось.
    """
    # Guardrail: проверка минимального бюджета ДО обращения к LLM (экономия токенов)
    if request_data.get("budget") and business_profile.get("ai_min_budget"):
        if request_data["budget"] < business_profile["ai_min_budget"]:
            logger.info(
                f"[auto_bidder] Budget {request_data['budget']} below min {business_profile['ai_min_budget']}, skip."
            )
            return None

    prompt = SALES_AGENT_SYSTEM_PROMPT.format(
        company_name=business_profile["company_name"],
        hub_name=request_data["hub"],
        knowledge_base=business_profile.get("knowledge_base_text", "Информация не указана"),
        request_title=request_data["title"],
        request_description=request_data["description"],
        request_district=request_data.get("district", "Не указан"),
        request_budget=request_data.get("budget", "Не указан"),
        currency=request_data.get("currency", "USD"),
        category_slug=request_data.get("category_slug", ""),
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "system", "content": prompt}],
            temperature=0.3,
            max_tokens=512,
            timeout=8.0,  # Hard deadline: 8 секунд
        )

        result = json.loads(response.choices[0].message.content)

        if not result.get("can_bid"):
            logger.info(f"[auto_bidder] AI decided not to bid: {result.get('reasoning')}")
            return None

        return result

    except Exception as e:
        logger.error(f"[auto_bidder] LLM error: {e}")
        return None


async def run_auction_pipeline(request_data: dict) -> dict:
    """
    Главный пайплайн: находит AI-бизнесы и создаёт ставки.
    """
    supabase = get_supabase_client()
    bids_created = 0

    # Найти всех подходящих AI-бизнесов
    businesses = (
        supabase.table("business_profiles")
        .select("*, profiles(hub_location)")
        .eq("ai_enabled", True)
        .execute()
        .data
    )

    # Фильтрация по хабу
    hub = request_data.get("hub")
    matched = [b for b in businesses if b.get("profiles", {}).get("hub_location") == hub]

    for business in matched:
        result = await evaluate_and_generate_bid(request_data, business)
        if result:
            bid_payload = {
                "request_id": request_data["id"],
                "provider_id": business["user_id"],
                "proposed_price": result["proposed_price"],
                "currency": request_data.get("currency", "USD"),
                "comment": result["comment"],
                "bid_type": "ai_agent",
                "status": "pending",
            }
            supabase.table("bids").insert(bid_payload).execute()
            bids_created += 1
            logger.info(f"[auto_bidder] Bid created for business {business['company_name']}")

    return {
        "status": "success",
        "processed_businesses": len(matched),
        "bids_created": bids_created,
    }
```

---

## 4. FastAPI Endpoints (`main.py`)

```python
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from services.auto_bidder import run_auction_pipeline
import logging

app = FastAPI(title="NeedTnow AI Worker", version="1.0.0")
logger = logging.getLogger(__name__)


class WebhookPayload(BaseModel):
    type: str          # "INSERT"
    table: str         # "requests"
    record: dict       # row data


@app.post("/api/v1/ai/trigger-auction")
async def trigger_auction(payload: WebhookPayload, background_tasks: BackgroundTasks):
    """
    Вызывается Supabase Database Webhook при INSERT в таблицу requests.
    Запускает AI auto-bidding в фоне (не блокирует ответ).
    """
    if payload.type != "INSERT" or payload.table != "requests":
        raise HTTPException(status_code=400, detail="Invalid webhook event")

    # Запускаем пайплайн в фоне для быстрого ответа (< 200ms)
    background_tasks.add_task(run_auction_pipeline, payload.record)

    return {"status": "accepted", "message": "Auction pipeline queued"}


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai_worker"}
```

---

## 5. RAG — Embeddings для Knowledge Base (`services/rag_service.py`)

```python
from openai import AsyncOpenAI
from core.config import settings
from core.database import get_supabase_client

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def update_knowledge_base_embedding(business_id: str, knowledge_text: str):
    """
    При сохранении базы знаний — создаём embedding и обновляем в БД.
    """
    response = await client.embeddings.create(
        model="text-embedding-3-small",  # 1536 dims, дешевле ada-002
        input=knowledge_text,
    )
    embedding = response.data[0].embedding

    supabase = get_supabase_client()
    supabase.table("business_profiles").update(
        {"knowledge_base_embedding": embedding}
    ).eq("id", business_id).execute()


async def find_similar_businesses(query_text: str, hub: str, top_k: int = 5) -> list:
    """
    Семантический поиск бизнесов с похожей базой знаний (для будущей функции рекомендаций).
    """
    response = await client.embeddings.create(
        model="text-embedding-3-small",
        input=query_text,
    )
    query_embedding = response.data[0].embedding

    supabase = get_supabase_client()
    result = supabase.rpc(
        "match_businesses_by_embedding",
        {
            "query_embedding": query_embedding,
            "hub_filter": hub,
            "match_count": top_k,
        },
    ).execute()

    return result.data
```

---

## 6. Конфигурация (`core/config.py`)

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OPENAI_API_KEY: str
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str           # Используем service_key в воркере
    AI_WORKER_SECRET: str = "changeme"  # Секрет для верификации Supabase Webhook
    DEBUG: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
```

### `.env.example`
```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AI_WORKER_SECRET=super_secret_token_123
DEBUG=false
```

---

## 7. Производительность и лимиты

| Параметр | Значение |
|---|---|
| Модель | `gpt-4o-mini` |
| Температура | 0.3 (детерминированность) |
| Max tokens | 512 |
| Timeout LLM | 8 секунд |
| Целевое время ответа | ≤ 5 секунд (конец-в-конец) |
| Параллельные запросы к AI | До 10 (asyncio gather) |
| Мин. бюджет для триггера AI | Настраивается на бизнес |

---

## 8. Правила выбора версий моделей Gemini (STRICT POLICY)

> **КРИТИЧЕСКОЕ ТРЕБОВАНИЕ АРХИТЕКТУРЫ**: В цепочке фолбека Gemini API запрещено использовать модели ниже версии 3.5 (`gemini-1.5-*`, `gemini-2.0-*` не используются из-за несовместимости и устаревания API v1beta).

### Разрешенные модели в фолбек-цепочке:
1. `gemini-3.8-flash` (Основная высокоскоростная модель)
2. `gemini-3.5-flash` (Первый резерв)
3. `gemini-3.5-pro` (Второй резерв повышенной точности)

При вызове `analyzeRequestFlowWithAI()` список `fallbackModels` настраивается строго в соответствии с данным правилом. При 404/устаревании модели Telegram-оповещения суперадмину не отправляются, система автоматически переходит к следующей модели версии 3.5+.

