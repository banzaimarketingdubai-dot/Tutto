import { test, expect } from '@playwright/test'
import { injectTelegramMock } from './mocks/telegram'

test.describe('Super Admin Panel E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock Telegram WebApp environment so the app loads properly
    await injectTelegramMock(page)
  })

  test('should require PIN and allow access to verification module', async ({ page }) => {
    // 1. Load the app with the superadmin query param
    await page.goto('/?superadmin=true')
    await page.waitForLoadState('networkidle')

    // 2. Check that the Restricted Area PIN screen appears
    await expect(page.locator('text=Restricted Area')).toBeVisible()
    await expect(page.locator('text=Введите PIN-код')).toBeVisible()

    // 3. Enter wrong PIN and check alert
    const pinInput = page.locator('input[type="password"]')
    await pinInput.fill('1234')
    
    page.on('dialog', dialog => dialog.accept())
    await page.locator('button[type="submit"]:has-text("Войти")').click({ force: true })
    
    // The PIN input should be cleared on error
    await expect(pinInput).toHaveValue('')

    // 4. Enter correct PIN and submit
    await pinInput.fill('7777')
    await page.locator('button[type="submit"]:has-text("Войти")').click({ force: true })

    // 5. Verify Dashboard is loaded (check for metrics)
    await expect(page.locator('text=Super Admin').first()).toBeVisible()
    await expect(page.locator('text=Аналитика Монетизации (Выручка)').first()).toBeVisible()

    // 6. Navigate to Verification (VIP) module
    await page.locator('button:has-text("Верификация (VIP)")').click({ force: true })

    // 7. Verify the Verification module content
    await expect(page.locator('text=Заявки на Verified Partner (VIP)')).toBeVisible()
    await expect(page.locator('text=Phuket Drive')).toBeVisible()
    await expect(page.locator('button:has-text("Верифицировать")').first()).toBeVisible()
  })
})
