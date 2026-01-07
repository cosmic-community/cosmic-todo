'use client'

import { useState, useEffect } from 'react'
import { List } from '@/types'
import MobileHeader from '@/components/MobileHeader'

interface ClientMobileHeaderProps {
  currentListSlug?: string
}

export default function ClientMobileHeader({ currentListSlug }: ClientMobileHeaderProps) {
  const [lists, setLists] = useState<List[]>([])
  const [currentList, setCurrentList] = useState<List | undefined>(undefined)

  useEffect(() => {
    async function fetchLists() {
      try {
        const response = await fetch('/api/lists')
        if (response.ok) {
          const data = await response.json()
          setLists(data.lists)
          
          if (currentListSlug) {
            const found = data.lists.find((l: List) => l.slug === currentListSlug)
            setCurrentList(found)
          }
        }
      } catch (error) {
        console.error('Error fetching lists:', error)
      }
    }

    fetchLists()
    
    // Poll for list updates
    const interval = setInterval(fetchLists, 5000)
    return () => clearInterval(interval)
  }, [currentListSlug])

  return <MobileHeader lists={lists} currentList={currentList} />
}