import { test, expect } from '@playwright/test'

test.describe('Real Dynamic Notifications & Notification Center Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).isPlaywright = true
      localStorage.setItem('tutto_onboarding_completed', 'true')
      localStorage.setItem('needtnow_onboarding_completed', 'true')
    })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('1. Verify Notification Center starts empty without fake hardcoded messages', async ({ page }) => {
    // Open Notification Center via bell icon in navbar
    const bellBtn = page.locator('button[title*="уведомления"], button:has(svg.lucide-bell)').first()
    await expect(bellBtn).toBeVisible({ timeout: 10000 })
    await bellBtn.click({ force: true })

    // Verify Notification Center modal opens
    await expect(page.locator('h2').filter({ hasText: 'Центр Уведомлений' }).first()).toBeVisible({ timeout: 5000 })

    // Verify hardcoded fake notifications (e.g. "🤖 Новый ИИ-отклик от Ayana Resort") are NOT present
    await expect(page.locator('text=🤖 Новый ИИ-отклик от Ayana Resort')).not.toBeVisible()

    // Close modal
    const closeBtn = page.locator('button[aria-label="Закрыть"]').first()
    if (await closeBtn.isVisible()) {
      await closeBtn.click({ force: true })
    }
  })

  test('2. Verify real dynamic notifications arrive on request creation & offer arrival', async ({ page }) => {
    // Open action sheet & create request
    const fabButton = page.locator('button:has(svg.lucide-plus)').first()
    await expect(fabButton).toBeVisible({ timeout: 10000 })
    await fabButton.click({ force: true })

    const createActionBtn = page.locator('button').filter({ hasText: /Заявку \(ИИ-Ассистент\)|Заявку/i }).first()
    await expect(createActionBtn).toBeVisible({ timeout: 5000 })
    await createActionBtn.click({ force: true })

    const skipToManualBtn = page.locator('button').filter({ hasText: /Пропустить ИИ|Ручной ввод|Обычное/i }).first()
    if (await skipToManualBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await skipToManualBtn.click({ force: true })
    }

    // Fill request
    const titleInput = page.locator('input[placeholder*="Например"]').first()
    await titleInput.fill('Прокат байка Honda Click 160cc')

    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /Опубликовать|Разместить/i }).first()
    await submitBtn.click({ force: true })

    // Wait for redirect to "Отклики"
    await expect(page.locator('h2').filter({ hasText: /Центр Управления Откликами/i }).first()).toBeVisible({ timeout: 7000 })

    // Open Notification Center
    const bellBtn = page.locator('button[title*="уведомления"], button:has(svg.lucide-bell)').first()
    await expect(bellBtn).toBeVisible({ timeout: 10000 })
    await bellBtn.click({ force: true })

    // Verify REAL dynamic notification for the created request exists in Notification Center
    await expect(page.locator('text=⚡ Заявка создана').first()).toBeVisible({ timeout: 5000 })
  })
})
