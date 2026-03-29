import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * Crée un lien vers le portail client Stripe (gérer abonnement, factures).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Find or create Stripe customer
    const customers = await getStripe().customers.list({ email: user.email, limit: 1 })
    let customerId: string

    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      const customer = await getStripe().customers.create({ email: user.email, metadata: { user_id: user.id } })
      customerId = customer.id
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.nextUrl.origin}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Portal creation failed' }, { status: 500 })
  }
}
