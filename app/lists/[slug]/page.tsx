// app/lists/[slug]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getLists } from '@/lib/cosmic'
import { List } from '@/types'
import ClientTaskList from '@/components/ClientTaskList'
import ClientSidebar from '@/components/ClientSidebar'
import ClientMobileHeader from '@/components/ClientMobileHeader'

// Changed: Disable caching for this page to always show latest data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ListPageProps {
  params: Promise<{ slug: string }>
}

async function ListContent({ slug }: { slug: string }) {
  // Changed: Fetch lists to find the current list for display
  const lists = await getLists()
  const list = lists.find((l: List) => l.slug === slug)
  
  if (!list) {
    notFound()
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Changed: Server-rendered sidebar hidden on mobile */}
      <ClientSidebar currentListSlug={slug} />
      
      {/* Changed: Mobile header - client component */}
      <ClientMobileHeader currentListSlug={slug} />
      
      {/* Changed: Main content area - adjusted padding for larger mobile header */}
      <main className="flex-1 overflow-y-auto pt-[72px] md:pt-0">
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
          {/* Changed: List header with color indicator - increased sizes for mobile */}
          <div className="mb-6 flex items-center gap-3">
            <div 
              className="w-5 h-5 md:w-4 md:h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: list.metadata.color || '#3b82f6' }}
            />
            {/* Changed: Increased heading size on mobile */}
            <h1 className="text-3xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {list.metadata.name}
            </h1>
          </div>
          
          {/* Task list component */}
          <ClientTaskList listSlug={slug} />
        </div>
      </main>
    </div>
  )
}

export default async function ListPage({ params }: ListPageProps) {
  const { slug } = await params
  
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    }>
      <ListContent slug={slug} />
    </Suspense>
  )
}