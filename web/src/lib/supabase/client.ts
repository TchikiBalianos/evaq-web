import { createBrowserClient } from '@supabase/ssr'

// Les types seront générés avec : npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
// puis : import type { Database } from './types' + createBrowserClient<Database>(...)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
