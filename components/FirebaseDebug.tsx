/**
 * Firebase Debug Component
 * Shows Firebase configuration status for debugging
 * Only renders in development or when ?debug=true is in URL
 */

'use client'

import { useEffect, useState } from 'react'

export default function FirebaseDebug() {
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Show debug info in development or when debug=true in URL
    const isDevelopment = process.env.NODE_ENV === 'development'
    const hasDebugParam = typeof window !== 'undefined' && window.location.search.includes('debug=true')
    
    if (isDevelopment || hasDebugParam) {
      setShowDebug(true)
    }
  }, [])

  if (!showDebug) return null

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown'

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm shadow-lg z-50 opacity-90">
      <h3 className="font-bold mb-2 text-yellow-400">🔧 Firebase Debug Info</h3>
      
      <div className="space-y-1 mb-3">
        <div><strong>Domain:</strong> {currentDomain}</div>
        <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
      </div>
      
      <div className="space-y-1">
        <div><strong>Firebase Config:</strong></div>
        <div className="ml-2">
          <div>API Key: {config.apiKey ? '✅' : '❌'}</div>
          <div>Auth Domain: {config.authDomain ? '✅' : '❌'}</div>
          <div>Project ID: {config.projectId ? '✅' : '❌'}</div>
          <div>App ID: {config.appId ? '✅' : '❌'}</div>
        </div>
      </div>

      {config.authDomain && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div><strong>Auth Domain:</strong></div>
          <div className="text-green-400 break-all">{config.authDomain}</div>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-gray-600 text-xs">
        <div><strong>⚠️ Action Required:</strong></div>
        <div>Add <span className="text-blue-400">{currentDomain}</span> to Firebase authorized domains</div>
      </div>

      <button 
        onClick={() => setShowDebug(false)}
        className="absolute top-1 right-2 text-gray-400 hover:text-white"
      >
        ×
      </button>
    </div>
  )
}