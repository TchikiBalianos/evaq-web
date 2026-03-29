import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Les types seront générés avec : npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Dans un Server Component, set n'est pas disponible.
            // Le middleware gère le refresh de session.
          }
        },
      },
    }
  )
}
