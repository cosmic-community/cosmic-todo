'use client'

import { useState, useEffect } from 'react'
import { List } from '@/types'
import { useRouter } from 'next/navigation'

interface ClientListHeaderProps {
  listSlug: string
}

export default function ClientListHeader({ listSlug }: ClientListHeaderProps) {
  const [list, setList] = useState<List | null>(null)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchList() {
      try {
        const response = await fetch('/api/lists')
        if (response.ok) {
          const data = await response.json()
          const found = data.lists.find((l: List) => l.slug === listSlug)
          if (found) {
            setList(found)
          } else {
            setNotFound(true)
          }
        }
      } catch (error) {
        console.error('Error fetching list:', error)
      }
    }

    fetchList()
  }, [listSlug])

  useEffect(() => {
    if (notFound) {
      router.push('/404')
    }
  }, [notFound, router])

  if (!list) {
    return (
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-indigo-400">
        {list.title}
      </h1>
    </div>
  )
}