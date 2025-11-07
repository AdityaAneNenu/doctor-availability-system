'use client'

import { useState, useEffect, useCallback } from 'react'
import { auth, db } from './firebase'
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

interface Profile {
  id: string
  name: string
  age: number
  sex: string
  role: string
  hospital_name?: string
  address?: string
  phone_number?: string
  avatar_url?: string
}

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string, forceRefresh = false) => {
    try {
      console.log(`Fetching profile for user: ${userId}, forceRefresh: ${forceRefresh}`)
      const profileRef = doc(db, 'profiles', userId)
      const profileSnap = await getDoc(profileRef)

      if (profileSnap.exists()) {
        const data = profileSnap.data() as Profile
        console.log('Profile data loaded:', data)
        setProfile(data)
      } else {
        console.log('No profile data found for user:', userId)
        setProfile(null)
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      setProfile(null)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.uid, true)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      
      if (firebaseUser) {
        setUser(firebaseUser)
        await fetchProfile(firebaseUser.uid)
      } else {
        setUser(null)
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [fetchProfile])

  const signOut = async () => {
    try {
      console.log('Starting sign out process...')
      setLoading(true)
      
      await firebaseSignOut(auth)
      
      console.log('Sign out successful, clearing state...')
      // Clear local state immediately
      setUser(null)
      setProfile(null)
      
      console.log('Redirecting to home page...')
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to sign out:', error)
      alert('Failed to sign out. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    isAuthenticated: !!user
  }
}
