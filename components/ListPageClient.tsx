'use client'

import { useState } from 'react'
import ClientTaskList from '@/components/ClientTaskList'
import ClientSidebar from '@/components/ClientSidebar'
import ClientMobileHeader from '@/components/ClientMobileHeader'
import ClientListHeader from '@/components/ClientListHeader'
import SkeletonLoader from '@/components/SkeletonLoader'

interface ListPageClientProps {
  slug: string
}

export default function ListPageClient({ slug }: ListPageClientProps) {
  // Changed: Track when a list is being created to show loading state
  const [isCreatingList, setIsCreatingList] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
      {/* Mobile Header */}
      <ClientMobileHeader currentListSlug={slug} />
      
      {/* Desktop Sidebar */}
      <ClientSidebar 
        currentListSlug={slug} 
        onCreatingStateChange={setIsCreatingList}
      />
      
      {/* Changed: Main Content - properly scrollable with fixed header space */}
      <main className="flex-1 pt-16 md:pt-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 pb-32">
          {/* Changed: Show creating list loading state when a list is being created */}
          {isCreatingList ? (
            <SkeletonLoader variant="creating-list" />
          ) : (
            <>
              <ClientListHeader listSlug={slug} />
              <ClientTaskList listSlug={slug} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}