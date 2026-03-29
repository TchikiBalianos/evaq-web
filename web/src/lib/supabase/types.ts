// Types générés automatiquement par Supabase CLI.
// Remplacer ce fichier par : npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts

export type SubscriptionTier = 'free' | 'monthly' | 'yearly'

export type DefconLevel = 1 | 2 | 3 | 4 | 5

export type AlertMode = 'sage' | 'expert'

export type EventType = 'EQ' | 'FL' | 'TC' | 'VO' | 'DR' | 'WF' | 'CONFLICT' | 'HEALTH'

export type SignalType = 'stock' | 'depart' | 'danger' | 'aide'

export interface ActivePack {
  pack_id: 'alert' | 'evacuation' | 'kit' | 'preparation'
  purchased_at: string
  expires_at: string | null
}

// Types base de données (skeleton — remplacer par supabase gen types)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_tier: SubscriptionTier
          active_packs: ActivePack[]
          push_subscription: Record<string, unknown> | null
          defcon_threshold: DefconLevel
          alert_mode: AlertMode
          last_active_at: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['users']['Row']> & { id: string; email: string }
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      user_profiles: {
        Row: {
          user_id: string
          h3_index: string
          adults: number
          children: number
          pets: boolean
          has_car: boolean
          reduced_mobility: boolean
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['user_profiles']['Row']> & { user_id: string }
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>
      }
      alerts: {
        Row: {
          id: string
          source: string
          event_type: EventType
          title: string
          description: string
          latitude: number
          longitude: number
          radius_km: number
          severity: number
          score_fiabilite: number
          raw_data: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['alerts']['Row']>
      }
      inventory_items: {
        Row: {
          id: string
          user_id: string
          category: string
          title: string
          quantity: number
          unit: string
          expiry_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['inventory_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['inventory_items']['Row']>
      }
    }
  }
}
