'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { Task, List } from '@/types'
import TaskCard from '@/components/TaskCard'
import AddTaskForm from '@/components/AddTaskForm'
import { ChevronRight, Loader2 } from 'lucide-react'

interface TaskListProps {
  initialTasks: Task[]
  lists: List[]
  listSlug?: string
}

export default function TaskList({ initialTasks, lists, listSlug }: TaskListProps) {
  const [showCompleted, setShowCompleted] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isLoading, setIsLoading] = useState(false)
  const mountedRef = useRef(true)

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      
      if (mountedRef.current) {
        // Filter by list if listSlug is provided
        let filteredTasks = data.tasks as Task[]
        if (listSlug) {
          filteredTasks = filteredTasks.filter(
            task => task.metadata.list?.slug === listSlug
          )
        }
        setTasks(filteredTasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }, [listSlug])

  // Initial load and polling for real-time updates
  useEffect(() => {
    mountedRef.current = true
    
    // Poll for updates every 3 seconds
    const interval = setInterval(fetchTasks, 3000)
    
    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [fetchTasks])

  // Handlers for optimistic updates
  const handleOptimisticAdd = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev])
    // Fetch fresh data after a short delay to get the real task
    setTimeout(fetchTasks, 500)
  }, [fetchTasks])

  const handleOptimisticToggle = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, metadata: { ...task.metadata, completed: !task.metadata.completed } }
        : task
    ))
  }, [])

  const handleOptimisticDelete = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }, [])

  const handleOptimisticUpdate = useCallback((taskId: string, updates: Partial<Task['metadata']>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, metadata: { ...task.metadata, ...updates } }
        : task
    ))
    // Fetch fresh data after update
    setTimeout(fetchTasks, 500)
  }, [fetchTasks])

  const handleOptimisticStar = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, metadata: { ...task.metadata, starred: !task.metadata.starred } }
        : task
    ))
  }, [])

  const pendingTasks = tasks.filter(task => !task.metadata.completed)
  const completedTasks = tasks.filter(task => task.metadata.completed)
  
  return (
    <div className="space-y-2">
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      )}
      
      {/* Pending Tasks */}
      {pendingTasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          lists={lists}
          onOptimisticToggle={handleOptimisticToggle}
          onOptimisticDelete={handleOptimisticDelete}
          onOptimisticUpdate={handleOptimisticUpdate}
          onOptimisticStar={handleOptimisticStar}
        />
      ))}
      
      {/* Completed Section - Collapsible */}
      {completedTasks.length > 0 && (
        <div className="pt-4">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors py-2"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-90' : ''}`} />
            <span className="text-sm font-medium">Completed ({completedTasks.length})</span>
          </button>
          
          {showCompleted && (
            <div className="space-y-2 mt-2">
              {completedTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  lists={lists}
                  onOptimisticToggle={handleOptimisticToggle}
                  onOptimisticDelete={handleOptimisticDelete}
                  onOptimisticUpdate={handleOptimisticUpdate}
                  onOptimisticStar={handleOptimisticStar}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Empty State */}
      {pendingTasks.length === 0 && completedTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks yet. Add your first task below!</p>
        </div>
      )}
      
      {/* Add Task Form - Always at bottom */}
      <div className="pt-4">
        <AddTaskForm 
          lists={lists} 
          listSlug={listSlug} 
          onOptimisticAdd={handleOptimisticAdd}
        />
      </div>
    </div>
  )
}