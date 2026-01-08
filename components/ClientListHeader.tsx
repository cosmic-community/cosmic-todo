'use client'

import { useState, useEffect, useRef } from 'react'
import { List } from '@/types'
import { useRouter } from 'next/navigation'
import SkeletonLoader from '@/components/SkeletonLoader'

interface ClientListHeaderProps {
  listSlug: string
}

// Changed: Maximum time to wait for a new list to be created (30 seconds)
const MAX_POLL_TIME = 30000
// Changed: Polling interval (1 second)
const POLL_INTERVAL = 1000

export default function ClientListHeader({ listSlug }: ClientListHeaderProps) {
  const [list, setList] = useState<List | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Changed: Track if we're in "waiting for creation" mode
  const [isWaitingForCreation, setIsWaitingForCreation] = useState(false)
  const router = useRouter()
  // Changed: Track poll start time to implement timeout
  const pollStartTime = useRef<number | null>(null)
  // Changed: Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    let pollTimeout: NodeJS.Timeout | null = null

    async function fetchList() {
      if (!isMounted.current) return

      try {
        const response = await fetch('/api/lists')
        if (!isMounted.current) return
        
        if (response.ok) {
          const data = await response.json()
          const found = data.lists.find((l: List) => l.slug === listSlug)
          
          if (found) {
            // Changed: List found, update state and stop polling
            setList(found)
            setIsLoading(false)
            setIsWaitingForCreation(false)
            pollStartTime.current = null
          } else {
            // Changed: List not found - check if we should keep polling
            if (pollStartTime.current === null) {
              // First attempt, start polling timer
              pollStartTime.current = Date.now()
              setIsWaitingForCreation(true)
              setIsLoading(false)
            }
            
            const elapsed = Date.now() - pollStartTime.current
            
            if (elapsed < MAX_POLL_TIME) {
              // Changed: Keep polling - list might still be creating
              pollTimeout = setTimeout(fetchList, POLL_INTERVAL)
            } else {
              // Changed: Exceeded max poll time, list truly doesn't exist
              setNotFound(true)
              setIsWaitingForCreation(false)
            }
          }
        } else {
          // Changed: API error, stop and show error state
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching list:', error)
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    }

    fetchList()

    // Changed: Cleanup function to clear timeout
    return () => {
      if (pollTimeout) {
        clearTimeout(pollTimeout)
      }
    }
  }, [listSlug])

  useEffect(() => {
    if (notFound) {
      router.push('/404')
    }
  }, [notFound, router])

  // Changed: Show loading state while initially loading or waiting for list creation
  if (isLoading || isWaitingForCreation) {
    return (
      <div className="mb-6">
        <SkeletonLoader variant="header" />
        {isWaitingForCreation && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 animate-pulse">
            Creating your list...
          </p>
        )}
      </div>
    )
  }

  if (!list) {
    return null
  }

  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-indigo-400">
        {list.title}
      </h1>
    </div>
  )
}