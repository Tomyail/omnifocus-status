'use client'

import dynamic from 'next/dynamic'
import { format } from 'date-fns'

// Import the user profile component
const UserProfile = dynamic(() => import('@/components/user-profile'), {
  ssr: false,
})

export default function AuthHeader({ lastUpdated }: { lastUpdated: Date }) {
  return (
    <header className="max-w-5xl mx-auto mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          OmniFocus Activity
        </h1>
        <div className="flex-shrink-0">
          <UserProfile />
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Visualizing your completed tasks over time. Last updated: {format(lastUpdated, 'PPP')}
      </p>
    </header>
  )
} 