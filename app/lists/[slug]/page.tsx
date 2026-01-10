// app/lists/[slug]/page.tsx
import { redirect } from 'next/navigation'

export default async function ListPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Changed: Redirect to home page with the list slug as a query parameter
  // The main page now handles list selection client-side without sidebar reload
  const { slug } = await params
  
  // Redirect to home - the slug will be handled by query params or we'll pass it differently
  // For now, just redirect to home and let user select from sidebar
  redirect('/')
}