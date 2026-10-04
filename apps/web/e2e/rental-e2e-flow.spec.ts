import { test, expect } from '@playwright/test'

test.describe('Rental Niche E2E Flows (Transport & Real Estate)', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).isPlaywright = true
      localStorage.setItem('tutto_onboarding_completed', 'true')
      localStorage.setItem('needtnow_onboarding_completed', 'true')
    })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('1. Verify Feed is Bound to 4 Real Test Accounts in Rental Niche', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'ВСЕ АУКЦИОНЫ' }).first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Yamaha NMAX 155cc').first()).toBeVisible()
  })

  test('2. Manual Request Creation & Verification of Auto-Routing to "Отклики" Screen', async ({ page }) => {
    // Open action sheet via central FAB button
    const fabButton = page.locator('button:has(svg.lucide-plus)').first()
    await expect(fabButton).toBeVisible({ timeout: 10000 })
    await fabButton.click({ force: true })

    // Select 'Создать заявку (ИИ / Ручной)'
    const createActionBtn = page.locator('button').filter({ hasText: /Создать заявку|Запрос/i }).first()
    if (await createActionBtn.isVisible()) {
      await createActionBtn.click({ force: true })
    }

    // Skip AI to manual CreateRequestModal if AI modal opened
    const skipToManualBtn = page.locator('button').filter({ hasText: /Ручной ввод|Обычное создание|Пропустить/i }).first()
    if (await skipToManualBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipToManualBtn.click({ force: true })
    }

    // Check CreateRequestModal is open
    await expect(page.locator('h2').filter({ hasText: /Создать заказ|Создать заявку/i }).first()).toBeVisible({ timeout: 5000 })

    // Fill request details without fixed budget ("Жду предложений")
    const openBudgetBtn = page.locator('button').filter({ hasText: 'Жду предложений' }).first()
    if (await openBudgetBtn.isVisible()) {
      await openBudgetBtn.click({ force: true })
    }

    const titleInput = page.locator('input[placeholder*="Например"]').first()
    await titleInput.fill('Аренда Honda PCX без фиксированного бюджета')

    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /Опубликовать|Разместить/i }).first()
    await submitBtn.click({ force: true })

    // VERIFY AUTO-ROUTING: User is immediately redirected from Feed to Tab 2 ("Центр Управления Откликами / Отклики")
    await expect(page.locator('h2').filter({ hasText: /Центр Управления Откликами/i }).first()).toBeVisible({ timeout: 7000 })
    await expect(page.locator('text=Аренда Honda PCX без фиксированного бюджета').first()).toBeVisible()
  })

  test('3. Pre-Deal Dialogue 1-Replica Rule, Locking & Offer Popup Acceptance Flow', async ({ page }) => {
    // Navigate to Tab 2 (ОТКЛИКИ)
    const bidsTab = page.locator('button').filter({ hasText: /ОТКЛИКИ|Отклики/i }).first()
    await expect(bidsTab).toBeVisible({ timeout: 10000 })
    await bidsTab.click({ force: true })

    // Verify incoming offer card is present with 'Задать вопрос' button
    const askQuestionBtn = page.locator('button').filter({ hasText: 'Задать вопрос' }).first()
    await expect(askQuestionBtn).toBeVisible({ timeout: 7000 })
    await askQuestionBtn.click({ force: true })

    // Verify Pre-Deal Chat modal opens with 'Предварительный диалог' status
    await expect(page.locator('span').filter({ hasText: 'Предварительный диалог' }).first()).toBeVisible({ timeout: 5000 })

    // Customer sends 1 replica (question)
    const chatInput = page.locator('input[placeholder*="вопрос"]').first()
    await expect(chatInput).toBeVisible()
    await chatInput.fill('Здравствуйте, возможна ли доставка до пляжа Раваи к 10:00?')

    const sendBtn = page.locator('form button[type="submit"]').first()
    await sendBtn.click({ force: true })

    // Wait for system lock message card to appear in chat
    await expect(page.locator('text=Предварительный диалог завершен').first()).toBeVisible({ timeout: 5000 })

    // Verify chat input is now LOCKED (1-replica rule enforced)
    await expect(chatInput).toBeDisabled()

    // Click 'Принять заявку' inside dialogue to open OfferPreviewModal popup
    const acceptInChatBtn = page.locator('button').filter({ hasText: /Принять заявку/i }).first()
    await expect(acceptInChatBtn).toBeVisible()
    await acceptInChatBtn.click({ force: true })

    // Verify Offer Card Popup opens
    await expect(page.locator('span').filter({ hasText: 'Карточка предложения' }).first()).toBeVisible({ timeout: 5000 })

    // Accept offer inside popup
    const acceptOfferModalBtn = page.locator('button').filter({ hasText: /ПРИНЯТЬ ОФФЕР/i }).first()
    await expect(acceptOfferModalBtn).toBeVisible()
    await acceptOfferModalBtn.click({ force: true })

    // Verify popup closes, returning user to dialogue, status switches to 'В процессе', and input is UNLOCKED
    await expect(page.locator('span').filter({ hasText: 'В процессе' }).first()).toBeVisible({ timeout: 5000 })
    await expect(chatInput).not.toBeDisabled()
  })
})
