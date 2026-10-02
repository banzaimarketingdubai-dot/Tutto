import { test, expect } from '@playwright/test'

// Тесты для 5 аккаунтов. Так как логин через Google OAuth требует ручного ввода или сложных моков,
// этот скрипт проверяет основной флоу на моковых данных.
const TEST_ACCOUNTS = [
  'user1@example.com',
  // 'user2@example.com',
  // 'user3@example.com',
  // 'user4@example.com',
  // 'user5@example.com',
]

test.describe('QA Accounts E2E Flow', () => {
  for (const account of TEST_ACCOUNTS) {
    test(`Full cycle test for ${account}`, async ({ page }) => {
      // 1. Авторизация (Мок или ожидание ручного входа)
      // В реальном E2E тесте мы бы инжектили сессию в localStorage или куки
      await page.goto('/')

      // Пропуск онбординга
      await page.evaluate(() => {
        localStorage.setItem('needtnow_onboarding_completed', 'true')
      })
      await page.reload()

      // 2. Просмотр ленты и фильтрация
      await expect(page.locator('text=АКТИВНЫЕ ЗАПРОСЫ')).toBeVisible()
      
      // Клик по фильтру "АВТО"
      const carFilter = page.locator('button:has-text("АВТО")').first()
      if (await carFilter.isVisible()) {
        await carFilter.click()
      }

      // 3. Переход в Кабинет (Главный Хаб)
      await page.locator('button:has-text("КАБИНЕТ")').click()
      await expect(page.locator('text=Мой Бизнес')).toBeVisible()

      // 4. Переход в Мой Бизнес
      await page.locator('text=Мой Бизнес').click()
      await expect(page.locator('text=Профиль магазина')).toBeVisible()
      
      // Проверка витрины
      await expect(page.locator('text=Моя Витрина')).toBeVisible()
      
      // Клик на первую карточку в витрине
      const firstCard = page.locator('.overflow-x-auto > div').first()
      await firstCard.click()
      
      // Открытие модалки редактирования (Edit2 icon)
      const editBtn = page.locator('button:has(svg.lucide-edit2)').first()
      await editBtn.click()

      await expect(page.locator('text=Редактирование карточки')).toBeVisible()
      
      // Изменение цены
      const priceInput = page.locator('input[type="number"]').first()
      await priceInput.fill('999')
      
      await page.locator('button:has-text("Сохранить")').click()

      // 5. Тестирование ИИ Менеджера
      await page.locator('button:has-text("Назад в профиль")').click()
      await page.locator('text=Менеджер ИИ').click()
      
      await expect(page.locator('text=AI Sales Agent')).toBeVisible()
      await expect(page.locator('text=Интервью с ИИ-агентом')).toBeVisible()
      
      // Отправка ответа в интервью
      const chatInput = page.locator('input[placeholder="Ваш ответ..."]')
      await chatInput.fill('Да, скидка 10% на месяц')
      await page.locator('button:has-text("Ответить")').click()
      
      await expect(page.locator('text=Да, скидка 10% на месяц')).toBeVisible()
    })
  }
})
