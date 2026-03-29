import type { Metadata } from 'next'
import { AlertsList } from '@/components/alerts-list'

export const metadata: Metadata = { title: 'Alertes' }

export default function AlertesPage() {
  return <AlertsList />
}
