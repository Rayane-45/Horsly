import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return null if Supabase is not configured (preview environment)
  if (!supabaseUrl || !supabaseKey) {
    console.warn("[v0] Supabase credentials not configured. Some features will be disabled.")
    return null
  }

  if (supabaseClient) return supabaseClient

  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)

  return supabaseClient
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
