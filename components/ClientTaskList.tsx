'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'
import AddTaskForm from './AddTaskForm'
import type { Task, List } from '@/types'

interface ClientTaskListProps {
  initialTasks: Task[]
  listId?: string
  listSlug?: string
}

export default function ClientTaskList({ initialTasks, listId, listSlug }: ClientTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const newCompletedState = !task.metadata.completed

    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, metadata: { ...t.metadata, completed: newCompletedState } }
        : t
    ))

    try {
      // Changed: Added null check for task.metadata.list before accessing slug property
      const taskListSlug = task.metadata.list && typeof task.metadata.list === 'object' 
        ? task.metadata.list.slug 
        : null

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            completed: newCompletedState
          }
        })
      })

      if (!response.ok) {
        setTasks(tasks.map(t => 
          t.id === taskId 
            ? { ...t, metadata: { ...t.metadata, completed: !newCompletedState } }
            : t
        ))
        throw new Error('Failed to update task')
      }

      if (taskListSlug) {
        setTimeout(() => {
          window.location.href = `/lists/${taskListSlug}`
        }, 600)
      } else {
        setTimeout(() => {
          window.location.href = '/'
        }, 600)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    setTasks(tasks.filter(t => t.id !== taskId))

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        setTasks(tasks)
        throw new Error('Failed to delete task')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error deleting task:', error)
      setTasks(tasks)
    }
  }

  const handleAddTask = async (title: string, description: string, priority: string, dueDate: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          due_date: dueDate,
          list_id: listId
        })
      })

      if (!response.ok) throw new Error('Failed to create task')

      const { task } = await response.json()
      setTasks([...tasks, task])
      setShowAddForm(false)

      if (listSlug) {
        window.location.href = `/lists/${listSlug}`
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task')
    } finally {
      setIsLoading(false)
    }
  }

  const completedTasks = tasks.filter(t => t.metadata.completed)
  const incompleteTasks = tasks.filter(t => !t.metadata.completed)

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="space-y-4">
        {incompleteTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={handleTaskComplete}
            onDelete={handleTaskDelete}
          />
        ))}
      </div>

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      )}

      {showAddForm && (
        <AddTaskForm
          onSubmit={handleAddTask}
          onCancel={() => setShowAddForm(false)}
          isLoading={isLoading}
        />
      )}

      {completedTasks.length > 0 && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-4">
            {completedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleTaskComplete}
                onDelete={handleTaskDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}