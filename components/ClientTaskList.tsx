'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import TaskCard from './TaskCard'
import AddTaskForm from './AddTaskForm'
import type { Task, List } from '@/types'

interface ClientTaskListProps {
  listId?: string
  listSlug?: string
}

export default function ClientTaskList({ listId, listSlug }: ClientTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [lists, setLists] = useState<List[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Changed: Add state for collapsible completed section
  const [showCompleted, setShowCompleted] = useState(false)
  // Changed: Track tasks that are currently celebrating (showing confetti + fade out)
  const [celebratingTasks, setCelebratingTasks] = useState<Map<string, number>>(new Map())

  // Fetch tasks and lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Changed: Fetch tasks with listSlug parameter for proper filtering
        const tasksUrl = listSlug 
          ? `/api/tasks?listSlug=${listSlug}` 
          : listId 
            ? `/api/tasks?list=${listId}` 
            : '/api/tasks'
        const tasksResponse = await fetch(tasksUrl)
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json()
          setTasks(tasksData.tasks || [])
        }

        // Fetch lists
        const listsResponse = await fetch('/api/lists')
        if (listsResponse.ok) {
          const listsData = await listsResponse.json()
          setLists(listsData.lists || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [listId, listSlug])

  // Changed: Updated toggle handler to track celebrating tasks with proper timing
  const handleOptimisticToggle = useCallback((taskId: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId)
      if (task) {
        const newCompletedState = !task.metadata.completed
        
        // Changed: If task is becoming completed, add to celebrating map with timestamp
        if (newCompletedState) {
          setCelebratingTasks(prevCelebrating => {
            const newMap = new Map(prevCelebrating)
            newMap.set(taskId, Date.now())
            return newMap
          })
          
          // Changed: Increased delay to 1800ms to match TaskCard's full animation duration
          // TaskCard shows: 1200ms confetti + 500ms collapse + 100ms buffer = 1800ms total
          setTimeout(() => {
            setCelebratingTasks(prevCelebrating => {
              const newMap = new Map(prevCelebrating)
              newMap.delete(taskId)
              return newMap
            })
          }, 1800)
        }
      }
      
      return prev.map(t => 
        t.id === taskId 
          ? { ...t, metadata: { ...t.metadata, completed: !t.metadata.completed } }
          : t
      )
    })
  }, [])

  const handleOptimisticDelete = useCallback((taskId: string) => {
    // Changed: Also remove from celebrating if deleting
    setCelebratingTasks(prev => {
      const newMap = new Map(prev)
      newMap.delete(taskId)
      return newMap
    })
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }, [])

  const handleOptimisticUpdate = useCallback((taskId: string, updates: Partial<Task['metadata']>) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, metadata: { ...t.metadata, ...updates } }
        : t
    ))
  }, [])

  const handleOptimisticAdd = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev])
  }, [])

  // Changed: Include celebrating tasks in incomplete list so they stay visible during animation
  const incompleteTasks = tasks.filter(t => !t.metadata.completed || celebratingTasks.has(t.id))
  // Changed: Exclude celebrating tasks from completed list temporarily
  const completedTasks = tasks.filter(t => t.metadata.completed && !celebratingTasks.has(t.id))

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading tasks...
        </div>
      </div>
    )
  }

  return (
    // Changed: Use flex column with relative positioning for fixed add form
    <div className="flex flex-col h-full">
      {/* Changed: Scrollable task area with overflow-visible for confetti */}
      <div className="flex-1 pb-24 space-y-6" style={{ overflow: 'visible' }}>
        <div className="space-y-4" style={{ overflow: 'visible' }}>
          {incompleteTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              lists={lists}
              onOptimisticToggle={handleOptimisticToggle}
              onOptimisticDelete={handleOptimisticDelete}
              onOptimisticUpdate={handleOptimisticUpdate}
            />
          ))}
        </div>

        {/* Changed: Collapsible completed section */}
        {completedTasks.length > 0 && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-2 w-full"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-90' : ''}`} />
              <span className="text-sm font-medium">
                Completed ({completedTasks.length})
              </span>
            </button>
            
            {showCompleted && (
              <div className="space-y-4 mt-2">
                {completedTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    lists={lists}
                    onOptimisticToggle={handleOptimisticToggle}
                    onOptimisticDelete={handleOptimisticDelete}
                    onOptimisticUpdate={handleOptimisticUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Changed: Fixed add task form at bottom - increased z-index to be above task checkmarks */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-gray-800 z-20">
        <div className="max-w-2xl mx-auto">
          <AddTaskForm
            lists={lists}
            listSlug={listSlug}
            onOptimisticAdd={handleOptimisticAdd}
          />
        </div>
      </div>
    </div>
  )
}