'use client'

import { useState, useEffect, useRef } from 'react'
import { List, User } from '@/types'
import EditListModal from '@/components/EditListModal'
import { Settings, ChevronDown, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ClientListHeaderProps {
  listSlug: string
  refreshKey?: number
  // Changed: Added callback to notify parent about description presence
  onDescriptionChange?: (hasDescription: boolean) => void
}

export default function ClientListHeader({ listSlug, refreshKey, onDescriptionChange }: ClientListHeaderProps) {
  const [list, setList] = useState<List | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSharedDropdown, setShowSharedDropdown] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 10
  const isMountedRef = useRef(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    isMountedRef.current = true

    const fetchList = async () => {
      try {
        const response = await fetch(`/api/lists?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch lists')
        }
        
        const data = await response.json()
        const foundList = data.lists.find((l: List) => l.slug === listSlug)
        
        if (foundList) {
          if (isMountedRef.current) {
            setList(foundList)
            setIsLoading(false)
            setRetryCount(0)
            // Changed: Notify parent about description presence
            if (onDescriptionChange) {
              onDescriptionChange(!!foundList.metadata?.description)
            }
          }
        } else {
          // List not found, retry
          if (retryCount < maxRetries) {
            setTimeout(() => {
              if (isMountedRef.current) {
                setRetryCount(prev => prev + 1)
              }
            }, 500)
          } else {
            if (isMountedRef.current) {
              setIsLoading(false)
              // Changed: No description if list not found
              if (onDescriptionChange) {
                onDescriptionChange(false)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching list:', error)
        if (isMountedRef.current) {
          setIsLoading(false)
          // Changed: No description on error
          if (onDescriptionChange) {
            onDescriptionChange(false)
          }
        }
      }
    }

    fetchList()

    return () => {
      isMountedRef.current = false
    }
  }, [listSlug, retryCount, refreshKey, onDescriptionChange])

  // Changed: Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSharedDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Changed: Handler for optimistic list update - matches EditListModal's expected signature
  const handleOptimisticUpdate = (listId: string, updates: Partial<List['metadata']>) => {
    if (list && list.id === listId) {
      const updatedList: List = {
        ...list,
        metadata: {
          ...list.metadata,
          ...updates
        }
      }
      setList(updatedList)
      // Changed: Notify parent about description change after update
      if (onDescriptionChange) {
        onDescriptionChange(!!updatedList.metadata?.description)
      }
    }
  }

  // Changed: Handler for optimistic list delete - matches EditListModal's expected signature
  const handleOptimisticDelete = (listId: string) => {
    if (list && list.id === listId) {
      setList(null)
    }
  }

  // Changed: Handler for refresh
  const handleRefresh = () => {
    setRetryCount(prev => prev + 1)
  }

  // Changed: Helper function to get shared users as User objects
  const getSharedUsers = (): User[] => {
    if (!list) return []
    const sharedWith = list.metadata.shared_with || []
    return sharedWith.filter((u): u is User => typeof u === 'object' && u !== null && 'id' in u)
  }

  // Changed: Helper function to get display name for a user
  const getUserDisplayName = (userObj: User): string => {
    return userObj.metadata?.display_name || userObj.title || 'Unknown User'
  }

  if (isLoading) {
    return (
      <div className="mb-4 md:mb-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
      </div>
    )
  }

  if (!list) {
    return null
  }

  const sharedUsers = getSharedUsers()

  return (
    <>
      <div className="mb-4 md:mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Changed: Added dot before list name */}
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: list.metadata.color || '#3b82f6' }}
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {list.metadata.name}
              </h1>
            </div>
            {list.metadata.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 pl-5">
                {list.metadata.description}
              </p>
            )}
          </div>
          
          {/* Changed: Right side actions - shared users dropdown and settings */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Changed: Shared users dropdown */}
            {sharedUsers.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowSharedDropdown(!showSharedDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="View shared users"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">{sharedUsers.length}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showSharedDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showSharedDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Shared with
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {sharedUsers.map((sharedUser) => (
                        <div
                          key={sharedUser.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-medium text-accent flex-shrink-0">
                            {getUserDisplayName(sharedUser).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {getUserDisplayName(sharedUser)}
                            </p>
                            {sharedUser.metadata?.email && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {sharedUser.metadata.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Changed: Only show settings button for authenticated users */}
            {isAuthenticated && (
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Edit list"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal - Changed: Fixed props to match EditListModal interface */}
      {showEditModal && (
        <EditListModal
          list={list}
          onClose={() => setShowEditModal(false)}
          onOptimisticUpdate={handleOptimisticUpdate}
          onOptimisticDelete={handleOptimisticDelete}
          onRefresh={handleRefresh}
        />
      )}
    </>
  )
}