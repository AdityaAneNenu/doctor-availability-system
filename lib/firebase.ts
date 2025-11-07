/**
 * Firebase Configuration and Initialization
 * This file sets up Firebase services for authentication and database
 */

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Debug: Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
    authDomain: firebaseConfig.authDomain || '❌ Missing',
    projectId: firebaseConfig.projectId || '❌ Missing',
    storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
    messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
    appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing',
  })
}

// Validate required configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId']
const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig])

if (missingFields.length > 0) {
  throw new Error(`Missing required Firebase configuration fields: ${missingFields.join(', ')}`)
}

// Initialize Firebase (singleton pattern to prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase services
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)

// Export the app instance
export default app
