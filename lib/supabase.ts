import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database
export interface Link {
  id: string
  label: string
  created_at: string
}

export interface Visit {
  id: number
  link_id: string
  visitor_name: string
  visitor_email: string
  ip_address: string
  user_agent: string
  device_type: string
  browser: string
  os: string
  screen_width: number
  screen_height: number
  language: string
  referrer: string
  city: string
  country: string
  isp: string
  latitude: number | null
  longitude: number | null
  visited_at: string
  duration_seconds: number
}
