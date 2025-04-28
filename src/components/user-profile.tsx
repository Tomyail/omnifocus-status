'use client'

import { signInAction, signOutAction } from "@/actions/auth-actions"
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const toggleDropdown = () => setIsOpen(!isOpen)

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
  }

  if (!user) {
    return (
      <form action={signInAction}>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Sign In
        </button>
      </form>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center focus:outline-none"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User'}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
            {user.name?.charAt(0) || 'U'}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <form
            action={signOutAction}
            className="block px-4 py-2"
          >
            <button 
              type="submit"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full text-left"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
} 