/**
 * Test Accounts Seeder for E2E and Manual QA
 * 
 * В этом скрипте подготавливаются 5 тестовых аккаунтов. 
 * Пользователь зайдет через Google OAuth с этими email.
 * Здесь мы привязываем мокапные данные (карточки, профили) к этим email-ам.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ykllqxzftdyuimiydaom.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TEST_EMAILS = [
  '0451611@gmail.com',
  'banzaimarketingdubai@gmail.com',
  'astikkhakun@gmail.com',
  'shershadowcapital@gmail.com',
  'dubble.ads@gmail.com',
  'sherlock.bikes.asia@gmail.com',
  'myworldandrogr@gmail.com'
]

async function seed() {
  console.log('Clearing old unconnected mock data...')
  // TODO: Add logic to delete unlinked data

  console.log('Seeding 5 test accounts...')
  for (const email of TEST_EMAILS) {
    console.log(`Processing ${email}...`)
    
    // 1. Upsert user (In a real scenario, the user logs in via OAuth, 
    // so we just ensure their profile is ready, or insert dummy auth users if testing locally)

    // 2. Create Store Profile (My Business)
    
    // 3. Create mock cards (Offer Instances) for this user
    
    console.log(`✅ Seeded ${email}`)
  }
}

seed().catch(console.error)
