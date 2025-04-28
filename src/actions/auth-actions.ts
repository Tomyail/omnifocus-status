'use server'

import { signIn as authSignIn, signOut as authSignOut } from '@/auth'

export async function signInAction(formData: FormData) {
  // Default to GitHub provider if not specified
  await authSignIn('github')
}

export async function signOutAction() {
  await authSignOut()
} 