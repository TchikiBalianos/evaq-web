import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''

// Supabase admin client (service role) for webhook processing
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const productId = session.metadata?.product_id

      if (!userId || !productId) break

      if (productId === 'monthly' || productId === 'yearly') {
        // Subscription: update tier
        await supabase
          .from('users')
          .update({ subscription_tier: productId })
          .eq('id', userId)
      } else {
        // One-shot pack: add to active_packs
        const { data: user } = await supabase
          .from('users')
          .select('active_packs')
          .eq('id', userId)
          .single()

        const packs = (user?.active_packs ?? []) as Array<{ pack_id: string; purchased_at: string; expires_at: string | null }>
        packs.push({
          pack_id: productId,
          purchased_at: new Date().toISOString(),
          expires_at: null, // One-shot packs never expire
        })

        await supabase
          .from('users')
          .update({ active_packs: packs })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Find user by Stripe customer email
      const customer = await getStripe().customers.retrieve(customerId) as Stripe.Customer
      if (customer.email) {
        await supabase
          .from('users')
          .update({ subscription_tier: 'free' })
          .eq('email', customer.email)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
