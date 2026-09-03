import { supabase } from './supabase'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

const ADMIN_EMAIL = 'kumarbhanu818@gmail.com'

function isAdminEmail(email: string | undefined | null): boolean {
  return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

function getNameFromUser(user: { email?: string | null; user_metadata?: { full_name?: string } }): string {
  return (
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'User'
  )
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (error) {
      return { user: null, error: error.message }
    }

    if (!data.user) {
      return { user: null, error: 'Registration failed. Please try again.' }
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || email,
        name: name,
        role: isAdminEmail(data.user.email) ? 'admin' : 'user',
      },
      error: null,
    }
  } catch (err) {
    console.error('Sign up error:', err)
    return { user: null, error: 'An unexpected error occurred.' }
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error: error.message }
    }

    if (!data.user) {
      return { user: null, error: 'Login failed. Please try again.' }
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || email,
        name: getNameFromUser(data.user),
        role: isAdminEmail(data.user.email) ? 'admin' : 'user',
      },
      error: null,
    }
  } catch (err) {
    console.error('Sign in error:', err)
    return { user: null, error: 'An unexpected error occurred.' }
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    return { error: error?.message || null }
  } catch (err) {
    console.error('Sign out error:', err)
    return { error: 'An unexpected error occurred.' }
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return {
      id: user.id,
      email: user.email || '',
      name: getNameFromUser(user),
      role: isAdminEmail(user.email) ? 'admin' : 'user',
    }
  } catch (err) {
    console.error('Get current user error:', err)
    return null
  }
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
        name: getNameFromUser(session.user),
        role: isAdminEmail(session.user.email) ? 'admin' : 'user',
      })
    } else {
      callback(null)
    }
  })
}
