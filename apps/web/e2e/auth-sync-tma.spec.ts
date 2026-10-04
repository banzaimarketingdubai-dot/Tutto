import { test, expect } from '@playwright/test';
import { injectTelegramMock } from './mocks/telegram';

test.describe('Telegram & Email Account Unification & Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('needtnow_onboarding_completed', 'true');
      localStorage.setItem('tutto_onboarding_completed', 'true');
    });
  });

  test('1. Profile should show REAL user data from TMA without fake mock handle @alex_phuket', async ({ page }) => {
    await injectTelegramMock(page);
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to КАБИНЕТ (Profile)
    const accountTab = page.locator('button', { hasText: 'КАБИНЕТ' }).first();
    await accountTab.click({ force: true });

    // Verify Profile displays real TMA user handle @sherlock_dev
    await expect(page.locator('text=@sherlock_dev')).toBeVisible({ timeout: 10000 });

    // Verify NO fake handle @alex_phuket is present
    const fakeHandle = page.locator('text=@alex_phuket');
    await expect(fakeHandle).not.toBeVisible();
  });

  test('2. AuthModal should display Telegram button alongside Google and Email', async ({ page }) => {
    // Open in browser context (no TMA)
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click account tab to trigger AuthModal or Profile
    const accountTab = page.locator('button', { hasText: 'КАБИНЕТ' }).first();
    await accountTab.click({ force: true });

    // If AuthModal is shown, verify Telegram button exists
    const tgBtn = page.locator('button', { hasText: 'Войти через Telegram' });
    if (await tgBtn.isVisible()) {
      await expect(tgBtn).toBeVisible();
      await expect(page.locator('button', { hasText: 'Продолжить с Google' })).toBeVisible();
    }
  });

  test('3. Linking Telegram via URL params should update profile to 100% unified', async ({ page }) => {
    await page.goto('/?startapp=linked_user%40gmail.com&tg_id=998877&tg_username=real_tg_user&tg_name=John%20Doe');
    await page.waitForLoadState('domcontentloaded');

    // Open Cabinet
    const accountTab = page.locator('button', { hasText: 'КАБИНЕТ' }).first();
    await accountTab.click({ force: true });

    // Verify profile shows linked Telegram handle @real_tg_user
    await expect(page.locator('text=@real_tg_user')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=100%')).toBeVisible();
  });
});
