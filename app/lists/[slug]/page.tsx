// app/lists/[slug]/page.tsx
import ClientTaskList from '@/components/ClientTaskList'
import ClientSidebar from '@/components/ClientSidebar'
import ClientMobileHeader from '@/components/ClientMobileHeader'
import ClientListHeader from '@/components/ClientListHeader'

export default async function ListPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      {/* Mobile Header */}
      <ClientMobileHeader currentListSlug={slug} />
      
      {/* Desktop Sidebar */}
      <ClientSidebar currentListSlug={slug} />
      
      {/* Changed: Main Content - removed overflow-auto to allow confetti to display */}
      <main className="flex-1 pt-16 md:pt-0" style={{ overflow: 'visible' }}>
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8" style={{ overflow: 'visible' }}>
          <ClientListHeader listSlug={slug} />
          
          <ClientTaskList listSlug={slug} />
        </div>
      </main>
    </div>
  )
}