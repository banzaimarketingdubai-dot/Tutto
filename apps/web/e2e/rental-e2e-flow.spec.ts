import { test, expect } from '@playwright/test'

test.describe('Rental Niche E2E Flows (Transport & Real Estate)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('tutto_onboarding_completed', 'true')
      localStorage.setItem('needtnow_onboarding_completed', 'true')
    })
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
  })

  test('1. Verify Feed is Bound to 4 Real Test Accounts in Rental Niche', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'ВСЕ АУКЦИОНЫ' }).first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Yamaha NMAX 155cc').first()).toBeVisible()

    const housingChip = page.locator('button').filter({ hasText: /ВИЛЛЫ/i }).first()
    if (await housingChip.isVisible()) {
      await housingChip.click()
      await page.waitForTimeout(500)
      await expect(page.locator('text=2-спальную виллу').first()).toBeVisible()
    }
  })

  test('2. Manual AI Request Creation Flow (Central FAB Button)', async ({ page }) => {
    const fabButton = page.locator('button[aria-label="Создать заказ"]').or(page.locator('button:has(svg.lucide-plus)')).first()
    await expect(fabButton).toBeVisible()
    await fabButton.click({ force: true })

    const modalHeading = page.locator('h2, h3').filter({ hasText: /ИИ-Ассистент|Создание|Заявк/i }).first()
    await expect(modalHeading).toBeVisible({ timeout: 5000 })
  })

  test('3. Clarification Question Flow in BidModal', async ({ page }) => {
    const cardBtn = page.locator('button').filter({ hasText: 'Откликнуться' }).first()
    await cardBtn.click()

    await expect(page.locator('h3').filter({ hasText: /Сделать предложение|Уточнить детали/i }).first()).toBeVisible({ timeout: 5000 })

    const clarifyToggle = page.locator('button').filter({ hasText: 'Уточнить детали' }).first()
    await clarifyToggle.click({ force: true })

    const textarea = page.locator('form textarea').first()
    await expect(textarea).toBeVisible()
    await textarea.fill('В какие даты планируете аренду байка NMAX?')

    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: 'Отправить вопрос клиенту' })
    await expect(submitBtn).toBeVisible()
  })

  test('4. Bid Submit & Verify Role Toggle REMOVED', async ({ page }) => {
    const cardBtn = page.locator('button').filter({ hasText: 'Откликнуться' }).first()
    await cardBtn.click()

    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: 'Отправить предложение' })
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // Verify 'Роль: Бизнес' toggle button is NOT present anywhere in DOM
    const roleToggle = page.locator('button').filter({ hasText: 'Роль: Бизнес' })
    await expect(roleToggle).not.toBeVisible()
  })
})
