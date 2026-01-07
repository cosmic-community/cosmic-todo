'use client'

import { useOptimistic, useCallback } from 'react'
import { Task, List } from '@/types'
import TaskCard from '@/components/TaskCard'
import AddTaskForm from '@/components/AddTaskForm'

interface TaskListProps {
  tasks: Task[]
  lists: List[]
  listSlug?: string
}

// Types for optimistic actions
type OptimisticAction = 
  | { type: 'add'; task: Task }
  | { type: 'toggle'; taskId: string }
  | { type: 'delete'; taskId: string }
  | { type: 'update'; taskId: string; updates: Partial<Task['metadata']> }

export default function TaskList({ tasks, lists, listSlug }: TaskListProps) {
  // Optimistic state management for the entire task list
  const [optimisticTasks, addOptimisticAction] = useOptimistic(
    tasks,
    (currentTasks: Task[], action: OptimisticAction) => {
      switch (action.type) {
        case 'add':
          return [action.task, ...currentTasks]
        case 'toggle':
          return currentTasks.map(task => 
            task.id === action.taskId 
              ? { ...task, metadata: { ...task.metadata, completed: !task.metadata.completed } }
              : task
          )
        case 'delete':
          return currentTasks.filter(task => task.id !== action.taskId)
        case 'update':
          return currentTasks.map(task =>
            task.id === action.taskId
              ? { ...task, metadata: { ...task.metadata, ...action.updates } }
              : task
          )
        default:
          return currentTasks
      }
    }
  )

  // Handlers to pass down to child components
  const handleOptimisticAdd = useCallback((task: Task) => {
    addOptimisticAction({ type: 'add', task })
  }, [addOptimisticAction])

  const handleOptimisticToggle = useCallback((taskId: string) => {
    addOptimisticAction({ type: 'toggle', taskId })
  }, [addOptimisticAction])

  const handleOptimisticDelete = useCallback((taskId: string) => {
    addOptimisticAction({ type: 'delete', taskId })
  }, [addOptimisticAction])

  const handleOptimisticUpdate = useCallback((taskId: string, updates: Partial<Task['metadata']>) => {
    addOptimisticAction({ type: 'update', taskId, updates })
  }, [addOptimisticAction])

  const pendingTasks = optimisticTasks.filter(task => !task.metadata.completed)
  const completedTasks = optimisticTasks.filter(task => task.metadata.completed)
  
  return (
    <div className="space-y-6">
      {/* Add Task Form */}
      <AddTaskForm 
        lists={lists} 
        listSlug={listSlug} 
        onOptimisticAdd={handleOptimisticAdd}
      />
      
      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="space-y-2">
          {pendingTasks.map((task) => (
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
      
      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>Completed</span>
            <span className="text-sm text-gray-500">({completedTasks.length})</span>
          </h2>
          <div className="space-y-2">
            {completedTasks.map((task) => (
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
        </div>
      )}
      
      {/* Empty State */}
      {pendingTasks.length === 0 && completedTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks yet. Add your first task above!</p>
        </div>
      )}
    </div>
  )
}