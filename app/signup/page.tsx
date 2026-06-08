'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckSquare, AlertCircle, ArrowLeft } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()

  // Changed: Auto-redirect to login after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login')
    }, 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
      <div className="max-w-md w-full">
        {/* Changed: Added back to home link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <CheckSquare className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cosmic Todo</h1>
          </div>
          
          {/* Changed: Signup disabled message */}
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Signup Disabled
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              New account registration is currently disabled. Please contact an administrator if you need access.
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Redirecting to login in 3 seconds...
            </p>
            
            <Link
              href="/login"
              className="inline-block py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}