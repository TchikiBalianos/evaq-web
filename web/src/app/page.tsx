import { redirect } from 'next/navigation'

// La racine redirige vers le dashboard.
// Le middleware gère la protection : si non connecté → /login
export default function RootPage() {
  redirect('/dashboard')
}
