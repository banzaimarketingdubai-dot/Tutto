import { Page } from '@playwright/test';

export async function injectTelegramMock(page: Page) {
  await page.addInitScript(() => {
    (window as any).isPlaywright = true;
    (window as any).Telegram = {
      WebApp: {
        initData: 'query_id=AA...',
        initDataUnsafe: {
          user: { id: 123456, first_name: 'Sherlock', last_name: 'Test', username: 'sherlock_dev' },
        },
        colorScheme: 'dark',
        themeParams: {
          bg_color: '#0d1117',
          text_color: '#ffffff',
          button_color: '#00f2fe',
        },
        isExpanded: true,
        viewportHeight: 844,
        ready: () => {},
        expand: () => {},
        close: () => {},
        MainButton: {
          text: '',
          show: () => {},
          hide: () => {},
          onClick: () => {},
        },
        HapticFeedback: {
          impactOccurred: () => {},
        },
      },
    };
  });
}
