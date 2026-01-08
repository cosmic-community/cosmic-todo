// app/lists/[slug]/page.tsx
import ListPageClient from '@/components/ListPageClient'
import ClientSidebar from '@/components/ClientSidebar'
import ClientMobileHeader from '@/components/ClientMobileHeader'
import ClientListHeader from '@/components/ClientListHeader'
import CosmicBadge from '@/components/CosmicBadge'
import { getTasks, getLists, getListBySlug } from '@/lib/cosmic'
import { notFound } from 'next/navigation'
import { Task, List } from '@/types'

export default async function ListPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG || ''
  
  // Changed: Fetch list, tasks, and all lists server-side
  let list: List | null = null
  let initialTasks: Task[] = []
  let lists: List[] = []
  
  try {
    const [listResult, tasksResult, listsResult] = await Promise.all([
      getListBySlug(slug),
      getTasks(),
      getLists()
    ])
    list = listResult
    initialTasks = tasksResult
    lists = listsResult
  } catch (error) {
    console.error('Error fetching data:', error)
  }
  
  // If list not found, show 404
  if (!list) {
    notFound()
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
      {/* Mobile Header */}
      <ClientMobileHeader />
      
      {/* Desktop Sidebar */}
      <ClientSidebar />
      
      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 pb-32">
          {/* List Header */}
          <ClientListHeader list={list} />
          
          {/* Changed: Pass required props to ListPageClient */}
          <ListPageClient 
            initialTasks={initialTasks} 
            lists={lists} 
            listSlug={slug} 
          />
        </div>
      </main>
      
      {/* Cosmic Badge */}
      <CosmicBadge bucketSlug={bucketSlug} />
    </div>
  )
}