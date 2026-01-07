'use client'

import { useState, useRef, useEffect } from 'react'
import { List, Task } from '@/types'
import { Plus } from 'lucide-react'

interface AddTaskFormProps {
  lists: List[]
  listSlug?: string
  onOptimisticAdd: (task: Task) => void
}

export default function AddTaskForm({ lists, listSlug, onOptimisticAdd }: AddTaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Changed: Track when form should stay open (during and after submission for quick task adding)
  const keepOpenRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const defaultList = lists.find(list => list.slug === listSlug)
  
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isSubmitting) return
    
    // Changed: Mark that we want to keep the form open
    keepOpenRef.current = true
    setIsSubmitting(true)
    
    // Create optimistic task with temporary ID
    const optimisticTask: Task = {
      id: `temp-${Date.now()}`,
      slug: `temp-${Date.now()}`,
      title: title,
      type: 'tasks',
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      metadata: {
        title: title,
        completed: false,
        list: defaultList
      }
    }
    
    // Optimistically add the task immediately
    onOptimisticAdd(optimisticTask)
    
    // Reset form immediately but keep expanded
    const taskTitle = title
    setTitle('')
    
    // Changed: Use multiple requestAnimationFrame calls to ensure DOM is fully ready
    // This ensures focus happens after React re-render and browser paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
        // Changed: Reset keepOpen flag after focus is set
        keepOpenRef.current = false
      })
    })
    
    // Send to server in background
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          list: defaultList?.id || ''
        })
      })
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      keepOpenRef.current = false
      setIsExpanded(false)
      setTitle('')
    }
  }
  
  // Changed: Handle blur - only collapse if we're not in the middle of submission
  const handleBlur = () => {
    // Don't collapse if we're submitting or explicitly keeping open for quick task adding
    if (keepOpenRef.current || isSubmitting) {
      return
    }
    // Only collapse if empty
    if (!title.trim()) {
      setIsExpanded(false)
    }
  }
  
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-800"
      >
        <Plus className="w-5 h-5 text-blue-600" />
        <span>Add a Task</span>
      </button>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Add a Task"
          className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base"
          disabled={isSubmitting}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
    </form>
  )
}