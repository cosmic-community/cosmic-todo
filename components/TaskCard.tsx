'use client'

import { useState, useEffect } from 'react'
import { Task, List } from '@/types'
import { Trash2 } from 'lucide-react'

interface TaskCardProps {
  task: Task
  lists: List[]
  onOptimisticToggle: (taskId: string) => void
  onOptimisticDelete: (taskId: string) => void
  onOptimisticUpdate: (taskId: string, updates: Partial<Task['metadata']>) => void
  onSyncComplete?: (taskId: string) => void
}

// Simple confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  return (
    <div
      className="absolute w-2 h-2 rounded-full animate-confetti pointer-events-none"
      style={{
        backgroundColor: color,
        left: `${Math.random() * 100}%`,
        animationDelay: `${delay}ms`,
      }}
    />
  )
}

export default function TaskCard({ 
  task, 
  onOptimisticToggle,
  onOptimisticDelete,
  onSyncComplete
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  
  // Track when task becomes completed to trigger celebration
  const [wasCompleted, setWasCompleted] = useState(task.metadata.completed)
  
  useEffect(() => {
    // If task just became completed (wasn't before, is now)
    if (!wasCompleted && task.metadata.completed) {
      setShowCelebration(true)
      // Start fade out after celebration
      setTimeout(() => {
        setIsFadingOut(true)
      }, 600)
      // Hide celebration after animation
      setTimeout(() => {
        setShowCelebration(false)
      }, 800)
    }
    setWasCompleted(task.metadata.completed)
  }, [task.metadata.completed, wasCompleted])
  
  const handleToggleComplete = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    
    // Optimistic update - instant feedback
    onOptimisticToggle(task.id)
    
    // Background sync with server
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.metadata.completed })
      })
      
      if (response.ok && onSyncComplete) {
        // Server confirmed the change, clear pending state
        onSyncComplete(task.id)
      }
    } catch (error) {
      console.error('Error toggling task:', error)
      // Revert on error
      onOptimisticToggle(task.id)
    } finally {
      setIsUpdating(false)
    }
  }
  
  // Changed: Direct delete without confirmation
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDeleting) return
    
    setIsDeleting(true)
    
    // Optimistic delete - instant feedback
    onOptimisticDelete(task.id)
    
    // Background sync with server
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      // Note: We don't revert on error since the task is already removed from UI
      // A page refresh will restore it if the delete failed
    } finally {
      setIsDeleting(false)
    }
  }
  
  // Confetti colors
  const confettiColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  
  return (
    <div className={`relative transition-all duration-500 ${isFadingOut && task.metadata.completed ? 'opacity-0 scale-95 -translate-y-2' : 'opacity-100 scale-100'}`}>
      {/* Confetti celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {confettiColors.map((color, i) => (
            <ConfettiParticle key={i} delay={i * 50} color={color} />
          ))}
          {confettiColors.map((color, i) => (
            <ConfettiParticle key={i + 6} delay={i * 50 + 100} color={color} />
          ))}
        </div>
      )}
      
      <div 
        className="bg-white dark:bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-800"
        onClick={handleToggleComplete}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleToggleComplete()
          }}
          className="flex-shrink-0"
          aria-label={task.metadata.completed ? 'Mark as incomplete' : 'Mark as complete'}
          disabled={isUpdating}
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            task.metadata.completed
              ? 'bg-blue-600 border-blue-600'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          } ${showCelebration ? 'scale-125' : ''}`}>
            {task.metadata.completed && (
              <svg className={`w-3 h-3 text-white transition-transform ${showCelebration ? 'scale-110' : ''}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
        </button>
        
        {/* Title */}
        <span className={`flex-1 text-base transition-all ${
          task.metadata.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'
        }`}>
          {task.metadata.title}
        </span>
        
        {/* Delete button - only show for completed tasks */}
        {task.metadata.completed && (
          <button
            onClick={handleDelete}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label="Delete task"
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}