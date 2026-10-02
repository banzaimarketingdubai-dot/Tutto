export type Language = 'ru' | 'en' | 'th' | 'zh'

export interface LanguageOption {
  code: Language
  label: string
  flag: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
]

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ru: {
    // Top Nav & Brand
    app_title: 'TUTTO MINUTTO',
    app_slogan: 'ОБРАТНЫЙ АУКЦИОН УСЛУГ',
    wallet_title: 'Мой Кошелёк',
    
    // Bottom Nav Tabs
    tab_home: 'ГЛАВНАЯ',
    tab_my_bids: 'ОТКЛИКИ',
    tab_chat: 'ЧАТ',
    tab_account: 'КАБИНЕТ',
    tab_market: 'МАРКЕТ',
    tab_explore: 'ПОИСК',
    tab_mine: 'МОЁ',

    // Mode Switcher
    mode_rent: '🏠 АРЕНДА',
    mode_services: '🛠 УСЛУГИ',
    mode_market: '🔥 МАРКЕТ',

    // Actions & Buttons
    btn_create_request: 'СОЗДАТЬ ЗАЯВКУ',
    btn_respond: 'Откликнуться',
    btn_buy_now: 'Купить сейчас',
    btn_close: 'Закрыть',
    btn_cancel: 'Отмена',
    btn_confirm: 'Подтвердить',
    btn_search: 'Поиск',
    btn_reset: 'Сбросить',
    btn_apply_promo: 'Активировать',
    btn_share: 'Поделиться',
    btn_share_telegram: 'Поделиться в Telegram',
    
    // Feed & Headers
    header_active_requests: 'АКТИВНЫЕ ЗАПРОСЫ В ХАБЕ',
    header_flash_market: 'МАРКЕТ (ГОРЯЩИЕ ТОВАРЫ & ЛОТЫ)',
    header_search_explore: 'Поиск скутера, виллы, обмена...',
    header_quick_templates: 'Шаблоны в 1 клик',
    header_my_deals: 'Мои Сделки & Объявления',

    // Notifications Center
    modal_notifications_title: 'Центр Уведомлений',
    modal_notifications_sub: 'Сигналы аукционов и P2P-активность в реальном времени',
    filter_all: 'Все',
    filter_bids: 'Отклики',
    filter_market: 'Маркет',
    filter_rewards: 'Монеты',
    btn_mark_all_read: 'Прочитать всё',

    // Admin & Dispute Panel
    admin_panel_title: 'ADMIN PANEL',
    admin_panel_sub: 'Управление платформой и арбитраж',
    tab_disputes: 'Арбитраж',
    tab_analytics: 'Аналитика Маркета',
    btn_in_favor_client: 'В пользу Клиента',
    btn_in_favor_provider: 'В пользу Бизнеса',
    btn_reject_dispute: 'Отклонить апелляцию',

    // Deals & Chat
    deal_status_in_progress: 'В процессе',
    deal_status_awaiting: 'Ждёт подтверждения',
    deal_status_completed: 'Сделка закрыта',
    deal_status_disputed: 'Апелляция / Спор',
    btn_confirm_completion: '✅ ПОДТВЕРДИТЬ ВЫПОЛНЕНИЕ (+15 Coins)',
    btn_open_dispute: 'Спор',

    // Reviews & Karma
    review_modal_title: 'Оценка качества сделки',
    review_stars_label: 'Оцените работу исполнителя',
    btn_publish_review: 'Опубликовать отзыв (+15 Coins)',

    // Categories
    cat_transport: 'Прокат & Байки',
    cat_housing: 'Жильё & Виллы',
    cat_finance: 'Обмен валют',
    cat_services: 'Визы & Юристы',
    cat_food: 'Еда & Доставка',
    cat_cleaning: 'Клининг',
    cat_beauty: 'СПА & Массаж',

    // Badges & Labels
    badge_urgent: 'МИНУТ',
    badge_ai_bids: 'Откликов ИИ',
    badge_budget: 'Бюджет',
    badge_discount: 'Скидка',

    // Modals & Forms
    create_request_title: 'Создать заказ',
    create_request_sub: 'Исполнители предложат лучшие цены',
    ai_assistant_title: 'AI Ассистент',
    ai_assistant_sub: 'Поможет составить заявку',
    auth_title: 'Вход в систему',
    auth_sub: 'Войдите, чтобы создавать заявки, участвовать в аукционах и управлять профилем.',
    btn_publish_auction: 'Опубликовать заявку в аукцион',
    btn_publish_market: '🔥 Опубликовать лот в Маркете',
  },

  en: {
    // Top Nav & Brand
    app_title: 'TUTTO MINUTTO',
    app_slogan: 'REVERSE SERVICE AUCTION',
    wallet_title: 'My Wallet',
    
    // Bottom Nav Tabs
    tab_home: 'HOME',
    tab_my_bids: 'MY BIDS',
    tab_chat: 'CHAT',
    tab_account: 'PROFILE',
    tab_market: 'MARKET',
    tab_explore: 'SEARCH',
    tab_mine: 'MY ITEMS',

    // Mode Switcher
    mode_rent: '🏠 RENT',
    mode_services: '🛠 SERVICES',
    mode_market: '🔥 MARKET',

    // Actions & Buttons
    btn_create_request: 'CREATE REQUEST',
    btn_respond: 'Submit Bid',
    btn_buy_now: 'Buy Now',
    btn_close: 'Close',
    btn_cancel: 'Cancel',
    btn_confirm: 'Confirm',
    btn_search: 'Search',
    btn_reset: 'Reset',
    btn_apply_promo: 'Activate',
    btn_share: 'Share',
    btn_share_telegram: 'Share to Telegram',
    
    // Feed & Headers
    header_active_requests: 'ACTIVE HUB AUCTIONS',
    header_flash_market: 'HOT DEALS & ITEMS',
    header_search_explore: 'Search bikes, villas, currency...',
    header_quick_templates: '1-Click Quick Templates',
    header_my_deals: 'My Deals & Listings',

    // Notifications Center
    modal_notifications_title: 'Notification Center',
    modal_notifications_sub: 'Real-time auction signals & P2P activity',
    filter_all: 'All',
    filter_bids: 'Bids',
    filter_market: 'Market',
    filter_rewards: 'Coins',
    btn_mark_all_read: 'Mark All Read',

    // Admin & Dispute Panel
    admin_panel_title: 'ADMIN PANEL',
    admin_panel_sub: 'Platform Management & Dispute Resolution',
    tab_disputes: 'Arbitration',
    tab_analytics: 'Market Analytics',
    btn_in_favor_client: 'In Favor of Client',
    btn_in_favor_provider: 'In Favor of Provider',
    btn_reject_dispute: 'Reject Appeal',

    // Deals & Chat
    deal_status_in_progress: 'In Progress',
    deal_status_awaiting: 'Awaiting Confirmation',
    deal_status_completed: 'Deal Completed',
    deal_status_disputed: 'Disputed / Appeal',
    btn_confirm_completion: '✅ CONFIRM COMPLETION (+15 Coins)',
    btn_open_dispute: 'Dispute',

    // Reviews & Karma
    review_modal_title: 'Rate Deal Quality',
    review_stars_label: 'Rate provider service',
    btn_publish_review: 'Publish Review (+15 Coins)',

    // Categories
    cat_transport: 'Rentals & Bikes',
    cat_housing: 'Housing & Villas',
    cat_finance: 'Currency Exchange',
    cat_services: 'Visas & Legal',
    cat_food: 'Food & Delivery',
    cat_cleaning: 'Cleaning',
    cat_beauty: 'SPA & Massage',

    // Badges & Labels
    badge_urgent: 'MIN',
    badge_ai_bids: 'AI Bids',
    badge_budget: 'Budget',
    badge_discount: 'Discount',

    // Modals & Forms
    create_request_title: 'Create Request',
    create_request_sub: 'Providers will offer their best prices',
    ai_assistant_title: 'AI Assistant',
    ai_assistant_sub: 'Assists in creating requests',
    auth_title: 'Account Login',
    auth_sub: 'Log in to create requests, participate in auctions, and manage profile.',
    btn_publish_auction: 'Publish Request to Auction',
    btn_publish_market: '🔥 Publish to Flash Market',
  },

  th: {
    // Top Nav & Brand
    app_title: 'TUTTO MINUTTO',
    app_slogan: 'การประมูลบริการย้อนกลับ',
    wallet_title: 'กระเป๋าเงินของฉัน',
    
    // Bottom Nav Tabs
    tab_home: 'หน้าแรก',
    tab_my_bids: 'ข้อเสนอ',
    tab_chat: 'แชท',
    tab_account: 'โปรไฟล์',
    tab_market: 'ตลาด',
    tab_explore: 'ค้นหา',
    tab_mine: 'รายการของฉัน',

    // Mode Switcher
    mode_rent: '🏠 เช่า',
    mode_services: '🛠 บริการ',
    mode_market: '🔥 ตลาด',

    // Actions & Buttons
    btn_create_request: 'สร้างคำขอ',
    btn_respond: 'เสนอราคา',
    btn_buy_now: 'ซื้อทันที',
    btn_close: 'ปิด',
    btn_cancel: 'ยกเลิก',
    btn_confirm: 'ยืนยัน',
    btn_search: 'ค้นหา',
    btn_reset: 'รีเซ็ต',
    btn_apply_promo: 'เปิดใช้งาน',
    btn_share: 'แชร์',
    btn_share_telegram: 'แชร์ไปยัง Telegram',
    
    // Feed & Headers
    header_active_requests: 'การประมูลที่เปิดอยู่',
    header_flash_market: 'สินค้าและข้อเสนอดีๆ',
    header_search_explore: 'ค้นหา มอเตอร์ไซค์ พูลวิลล่า แลกเงิน...',
    header_quick_templates: 'แม่แบบสร้างด่วนใน 1 คลิก',
    header_my_deals: 'ข้อตกลงและรายการของฉัน',

    // Notifications Center
    modal_notifications_title: 'ศูนย์การแจ้งเตือน',
    modal_notifications_sub: 'สัญญาณการประมูลแบบเรียลไทม์',
    filter_all: 'ทั้งหมด',
    filter_bids: 'ข้อเสนอ',
    filter_market: 'ตลาด',
    filter_rewards: 'เหรียญ',
    btn_mark_all_read: 'อ่านทั้งหมด',

    // Admin & Dispute Panel
    admin_panel_title: 'แผงผู้ดูแลระบบ',
    admin_panel_sub: 'การจัดการแพลตฟอร์มและการแก้ข้อพิพาท',
    tab_disputes: 'อนุญาโตตุลาการ',
    tab_analytics: 'การวิเคราะห์ตลาด',
    btn_in_favor_client: 'เข้าข้างลูกค้า',
    btn_in_favor_provider: 'เข้าข้างผู้ให้บริการ',
    btn_reject_dispute: 'ปฏิเสธการอุทธรณ์',

    // Deals & Chat
    deal_status_in_progress: 'กำลังดำเนินการ',
    deal_status_awaiting: 'รอยืนยัน',
    deal_status_completed: 'เสร็จสิ้นข้อตกลง',
    deal_status_disputed: 'ข้อพิพาท / อุทธรณ์',
    btn_confirm_completion: '✅ ยืนยันการทำงานเสร็จสิ้น (+15 เหรียญ)',
    btn_open_dispute: 'ข้อพิพาท',

    // Reviews & Karma
    review_modal_title: 'ให้คะแนนคุณภาพดีล',
    review_stars_label: 'ประเมินการบริการ',
    btn_publish_review: 'เผยแพร่รีวิว (+15 เหรียญ)',

    // Categories
    cat_transport: 'เช่ารถและมอเตอร์ไซค์',
    cat_housing: 'ที่พักและวิลล่า',
    cat_finance: 'แลกเปลี่ยนเงินตรา',
    cat_services: 'วีซ่าและกฎหมาย',
    cat_food: 'อาหารและการจัดส่ง',
    cat_cleaning: 'ทำความสะอาด',
    cat_beauty: 'สปาและนวด',

    // Badges & Labels
    badge_urgent: 'นาที',
    badge_ai_bids: 'การตอบกลับ AI',
    badge_budget: 'งบประมาณ',
    badge_discount: 'ส่วนลด',

    // Modals & Forms
    create_request_title: 'สร้างคำขอ',
    create_request_sub: 'ผู้ให้บริการจะเสนอราคาที่ดีที่สุด',
    ai_assistant_title: 'ผู้ช่วย AI',
    ai_assistant_sub: 'ช่วยคุณสร้างคำขอ',
    auth_title: 'เข้าสู่ระบบ',
    auth_sub: 'เข้าสู่ระบบเพื่อสร้างคำขอ เข้าร่วมการประมูล และจัดการโปรไฟล์',
    btn_publish_auction: 'เผยแพร่คำขอสู่การประมูล',
    btn_publish_market: '🔥 เผยแพร่ไปยังตลาดด่วน',
  },

  zh: {
    // Top Nav & Brand
    app_title: 'TUTTO MINUTTO',
    app_slogan: '服务反向拍卖平台',
    wallet_title: '我的钱包',
    
    // Bottom Nav Tabs
    tab_home: '首页',
    tab_my_bids: '竞价',
    tab_chat: '聊天',
    tab_account: '个人中心',
    tab_market: '闪购集市',
    tab_explore: '探索搜索',
    tab_mine: '我的商品',

    // Mode Switcher
    mode_rent: '🏠 租赁',
    mode_services: '🛠 服务',
    mode_market: '🔥 集市',

    // Actions & Buttons
    btn_create_request: '发布需求',
    btn_respond: '参与竞价',
    btn_buy_now: '立即购买',
    btn_close: '关闭',
    btn_cancel: '取消',
    btn_confirm: '确认',
    btn_search: '搜索',
    btn_reset: '重置',
    btn_apply_promo: '激活',
    btn_share: '分享',
    btn_share_telegram: '分享至Telegram',
    
    // Feed & Headers
    header_active_requests: '进行中的服务拍卖',
    header_flash_market: '热门折扣商品',
    header_search_explore: '搜索摩托车、别墅、换汇...',
    header_quick_templates: '一键快捷模板',
    header_my_deals: '我的交易与列表',

    // Notifications Center
    modal_notifications_title: '通知中心',
    modal_notifications_sub: '实时拍卖信号与P2P动态',
    filter_all: '全部',
    filter_bids: '竞价',
    filter_market: '集市',
    filter_rewards: '代币',
    btn_mark_all_read: '全部已读',

    // Admin & Dispute Panel
    admin_panel_title: '管理面板',
    admin_panel_sub: '平台管理与争议仲裁',
    tab_disputes: '仲裁中心',
    tab_analytics: '集市数据分析',
    btn_in_favor_client: '判定客户胜诉',
    btn_in_favor_provider: '判定商家胜诉',
    btn_reject_dispute: '驳回上诉',

    // Deals & Chat
    deal_status_in_progress: '进行中',
    deal_status_awaiting: '等待确认',
    deal_status_completed: '交易已完成',
    deal_status_disputed: '争议 / 上诉中',
    btn_confirm_completion: '✅ 确认服务完成 (+15代币)',
    btn_open_dispute: '申请仲裁',

    // Reviews & Karma
    review_modal_title: '评价交易质量',
    review_stars_label: '请为商家服务评分',
    btn_publish_review: '发布评价 (+15代币)',

    // Categories
    cat_transport: '车辆租赁',
    cat_housing: '房屋别墅',
    cat_finance: '货币兑换',
    cat_services: '签证法律',
    cat_food: '美食外卖',
    cat_cleaning: '保洁家政',
    cat_beauty: '水疗按摩',

    // Badges & Labels
    badge_urgent: '分钟',
    badge_ai_bids: 'AI自动回复',
    badge_budget: '预算',
    badge_discount: '折扣',

    // Modals & Forms
    create_request_title: '发布需求',
    create_request_sub: '服务商将提供最优惠的报价',
    ai_assistant_title: 'AI 智能助手',
    ai_assistant_sub: '协助您快捷生成需求',
    auth_title: '账号登录',
    auth_sub: '登录后即可发布需求、参与竞价并管理个人中心',
    btn_publish_auction: '发布需求至拍卖',
    btn_publish_market: '🔥 发布至闪购集市',
  },
}

export function detectDefaultLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('app_language') as Language
    if (saved && TRANSLATIONS[saved]) {
      return saved
    }
  }
  return 'ru'
}

export function setSavedLanguage(lang: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_language', lang)
  }
}

export function t(lang: Language, key: string): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['ru']
  return dict[key] || TRANSLATIONS['ru'][key] || key
}
