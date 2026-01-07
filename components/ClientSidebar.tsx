'use client'

import { useState, useEffect } from 'react'
import { List } from '@/types'
import Sidebar from '@/components/Sidebar'

interface ClientSidebarProps {
  currentListSlug?: string
}

export default function ClientSidebar({ currentListSlug }: ClientSidebarProps) {
  const [lists, setLists] = useState<List[]>([])

  useEffect(() => {
    async function fetchLists() {
      try {
        const response = await fetch('/api/lists')
        if (response.ok) {
          const data = await response.json()
          setLists(data.lists)
        }
      } catch (error) {
        console.error('Error fetching lists:', error)
      }
    }

    fetchLists()
    
    // Poll for list updates
    const interval = setInterval(fetchLists, 5000)
    return () => clearInterval(interval)
  }, [])

  return <Sidebar lists={lists} currentListSlug={currentListSlug} />
}