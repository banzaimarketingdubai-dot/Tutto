import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ykllqxzftdyuimiydaom.supabase.co'
const supabaseUrl = rawUrl.replace(/^["']|["']$/g, '').trim()
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbGxxeHpmdGR5dWltaXlkYW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNTcyNjksImV4cCI6MjEwNTkzMzI2OX0.XU4GbuhVvrdCai6_oJSUGsEDNZPG3pPb1UxWsf7qUvA'
const supabaseAnonKey = rawKey.replace(/^["']|["']$/g, '').trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'tutto_supabase_auth_token'
  }
})

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
