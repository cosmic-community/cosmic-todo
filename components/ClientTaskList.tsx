'use client'

import { useState, useEffect, useCallback } from 'react'
import { Task, List } from '@/types'
import TaskList from './TaskList'
import AddTaskForm from './AddTaskForm'
import SkeletonLoader from './SkeletonLoader'

interface ClientTaskListProps {
  listSlug?: string
}

export default function ClientTaskList({ listSlug }: ClientTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [list, setList] = useState<List | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Changed: Track retry attempts for newly created lists
  const [listRetryCount, setListRetryCount] = useState(0)
  const maxRetries = 10

  // Changed: Fetch list with retry logic for newly created lists
  const fetchList = useCallback(async () => {
    if (!listSlug) {
      setList(null)
      return true // No list needed
    }

    try {
      const response = await fetch('/api/lists')
      if (!response.ok) {
        throw new Error('Failed to fetch lists')
      }
      
      const data = await response.json()
      const foundList = data.lists.find((l: List) => l.slug === listSlug)
      
      if (foundList) {
        setList(foundList)
        setListRetryCount(0)
        return true // List found
      }
      
      return false // List not found
    } catch (err) {
      console.error('Error fetching list:', err)
      return false
    }
  }, [listSlug])

  const fetchTasks = useCallback(async () => {
    try {
      const url = listSlug && list ? `/api/tasks?listId=${list.id}` : '/api/tasks'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError('Failed to load tasks')
    }
  }, [listSlug, list])

  // Changed: Initial load with retry logic for list
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      
      const listFound = await fetchList()
      
      if (listSlug && !listFound) {
        // List not found - might still be creating
        if (listRetryCount < maxRetries) {
          setTimeout(() => {
            setListRetryCount(prev => prev + 1)
          }, 500)
          return // Don't set isLoading to false yet
        } else {
          setError('List not found')
          setIsLoading(false)
          return
        }
      }
      
      // If no listSlug or list was found, fetch tasks
      if (!listSlug || listFound) {
        await fetchTasks()
      }
      
      setIsLoading(false)
    }
    
    loadData()
  }, [listSlug, listRetryCount, fetchList, fetchTasks])

  // Changed: Fetch tasks when list changes (after it's found)
  useEffect(() => {
    if (list && listSlug) {
      fetchTasks()
    }
  }, [list, listSlug, fetchTasks])

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev])
  }

  const handleTaskUpdated = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    )
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  // Changed: Show loading while list is being found (for newly created lists)
  if (isLoading || (listSlug && !list && listRetryCount > 0 && listRetryCount < maxRetries)) {
    return (
      <div className="space-y-3">
        <SkeletonLoader variant="task" count={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <AddTaskForm 
        listId={list?.id} 
        onTaskCreated={handleTaskCreated}
      />
      
      <TaskList 
        tasks={tasks}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  )
}